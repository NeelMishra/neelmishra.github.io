"""Run the StatQuest companion's IBM churn experiment (Python 3.12).

python churn_walkthrough.py --data Telco_customer_churn.xlsx --out results
Omit --data to download IBM's workbook to the output directory.
Figures in the note use the committed results.json from this exact script.
"""
from pathlib import Path
import argparse
import hashlib
import json
import platform
import urllib.request

import numpy as np
import pandas as pd
import sklearn
import xgboost as xgb
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.metrics import confusion_matrix, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

DATA_URL = ("https://public.dhe.ibm.com/software/data/sw-library/"
            "cognos/mobile/C11/data/Telco_customer_churn.xlsx")

def evaluate(model, X, y):
    prob = model.predict_proba(X)[:, 1]
    pred = prob >= 0.5
    return {
        "auc": float(roc_auc_score(y, prob)),
        "churn_precision": float(precision_score(y, pred)),
        "churn_recall": float(recall_score(y, pred)),
        "confusion_matrix": confusion_matrix(y, pred, labels=[0, 1]).tolist(),
        "best_iteration": int(model.best_iteration),
        "trees_used": int(model.best_iteration + 1),
        "trees_trained": int(model.get_booster().num_boosted_rounds()),
    }

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path)
    parser.add_argument("--out", type=Path, default=Path("results"))
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    data_path = args.data or args.out / "Telco_customer_churn.xlsx"
    if args.data is None and not data_path.exists():
        urllib.request.urlretrieve(DATA_URL, data_path)
    df = pd.read_excel(data_path)
    df["Total Charges"] = pd.to_numeric(df["Total Charges"], errors="coerce")
    y = df["Churn Value"].astype(int)
    X = df.drop(columns=["Churn Value", "Churn Label", "Churn Score", "CLTV",
                         "Churn Reason", "CustomerID", "Count", "Country",
                         "State", "Lat Long"])
    X_trainval, X_test, y_trainval, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(
        X_trainval, y_trainval, test_size=0.25,
        stratify=y_trainval, random_state=42)
    categorical = X.select_dtypes(include=["object", "str"]).columns.tolist()
    # Dense output keeps one-hot zeros as explicit observed values.
    preprocess = ColumnTransformer([
        ("categories", OneHotEncoder(handle_unknown="ignore",
                                      sparse_output=False), categorical)
    ], remainder="passthrough", verbose_feature_names_out=False)
    common = dict(objective="binary:logistic", tree_method="hist",
                  learning_rate=0.1, subsample=0.9, colsample_bytree=0.5,
                  gamma=0.25, min_child_weight=1, missing=np.nan,
                  eval_metric="auc", random_state=42, n_jobs=4)
    encoder = clone(preprocess)
    A_train = encoder.fit_transform(X_train)
    A_val = encoder.transform(X_val)
    baseline = xgb.XGBClassifier(**common, max_depth=3, reg_lambda=1,
                                 n_estimators=1000, early_stopping_rounds=20)
    baseline.fit(A_train, y_train, eval_set=[(A_val, y_val)], verbose=False)
    # Fit the encoder inside each fold. The final test set stays untouched.
    pipeline = Pipeline([
        ("encode", preprocess),
        ("model", xgb.XGBClassifier(**common, n_estimators=300))
    ])
    search = GridSearchCV(
        pipeline,
        {"model__max_depth": [2, 4], "model__reg_lambda": [1, 10],
         "model__scale_pos_weight": [1, 3]},
        scoring="roc_auc", cv=StratifiedKFold(3, shuffle=True, random_state=42),
        n_jobs=1, refit=False)
    search.fit(X_train, y_train)
    best = {key.removeprefix("model__"): value
            for key, value in search.best_params_.items()}
    final = xgb.XGBClassifier(**common, **best, n_estimators=1000,
                              early_stopping_rounds=20)
    final.fit(A_train, y_train, eval_set=[(A_val, y_val)], verbose=False)
    # Choices are fixed. Evaluate the test set at the predetermined threshold .5.
    A_test = encoder.transform(X_test)
    result = {
        "versions": {"python": platform.python_version(), "xgboost": xgb.__version__,
                     "scikit-learn": sklearn.__version__, "pandas": pd.__version__,
                     "numpy": np.__version__},
        "data_url": DATA_URL,
        "data_sha256": hashlib.sha256(data_path.read_bytes()).hexdigest(),
        "rows": len(df), "missing_total_charges": int(X["Total Charges"].isna().sum()),
        "split_rows": {"train": len(X_train), "validation": len(X_val), "test": len(X_test)},
        "encoded_features": int(A_train.shape[1]),
        "best_params": best, "cv_auc": float(search.best_score_),
        "threshold": 0.5,
        "baseline": evaluate(baseline, A_test, y_test),
        "tuned": evaluate(final, A_test, y_test),
        "validation_auc": final.evals_result()["validation_0"]["auc"],
    }
    final.save_model(args.out / "churn_model.json")
    # Separate teaching model: one tree, depth 2, without early stopping.
    small_params = {**common, **best, "max_depth": 2, "n_estimators": 1}
    small = xgb.XGBClassifier(**small_params).fit(A_train, y_train)
    result["teaching_tree"] = json.loads(small.get_booster().get_dump(
        dump_format="json", with_stats=True)[0])
    result["feature_names"] = encoder.get_feature_names_out().tolist()
    (args.out / "results.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({key: value for key, value in result.items()
                      if key not in ["validation_auc", "teaching_tree", "feature_names"]}, indent=2))
    import joblib
    joblib.dump(encoder, args.out / "encoder.joblib")

if __name__ == "__main__":
    main()

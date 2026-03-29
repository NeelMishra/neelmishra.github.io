/* ===== Blog Navigation Tree ===== */
/* Directory-based hierarchy with nested folders */
var BLOG_TREE = [
  {
    name: 'cpp',
    label: 'C++',
    children: [
      {
        name: 'stl',
        label: 'STL Series',
        children: [
          { title: 'Vectors', file: 'cpp/stl/vectors.html', links: ['cpp/stl/maps-sets.html'] },
          { title: 'Maps & Sets', file: 'cpp/stl/maps-sets.html', links: ['cpp/stl/vectors.html', 'cpp/stl/iterators.html'] },
          { title: 'Iterators', file: 'cpp/stl/iterators.html', links: ['cpp/stl/maps-sets.html', 'cpp/stl/algorithms.html'] },
          { title: 'Algorithms', file: 'cpp/stl/algorithms.html', links: ['cpp/stl/iterators.html', 'cpp/stl/smart-pointers.html'] },
          { title: 'Smart Pointers', file: 'cpp/stl/smart-pointers.html', links: ['cpp/stl/algorithms.html', 'cpp/deep-dives/raii.html'] }
        ]
      },
      {
        name: 'deep-dives',
        label: 'Deep Dives',
        children: [
          { title: 'RAII', file: 'cpp/deep-dives/raii.html', links: ['cpp/stl/smart-pointers.html', 'cpp/deep-dives/operator-overloading.html'] },
          { title: 'Operator Overloading', file: 'cpp/deep-dives/operator-overloading.html', links: ['cpp/deep-dives/raii.html', 'cpp/deep-dives/compile-link/translation-units.html'] },
          {
            name: 'compile-link',
            label: 'Compilation & Linking',
            children: [
              { title: 'Translation Units', file: 'cpp/deep-dives/compile-link/translation-units.html', links: ['cpp/deep-dives/operator-overloading.html', 'cpp/deep-dives/compile-link/linking.html'] },
              { title: 'Linking Deep Dive', file: 'cpp/deep-dives/compile-link/linking.html', links: ['cpp/deep-dives/compile-link/translation-units.html', 'cpp/deep-dives/compile-link/odr.html'] },
              { title: 'One Definition Rule', file: 'cpp/deep-dives/compile-link/odr.html', links: ['cpp/deep-dives/compile-link/linking.html', 'cpp/deep-dives/compile-link/build-systems.html'] },
              { title: 'Build Systems & CMake', file: 'cpp/deep-dives/compile-link/build-systems.html', links: ['cpp/deep-dives/compile-link/odr.html', 'cpp/concurrency/index.html'] }
            ]
          }
        ]
      },
      {
        name: 'concurrency',
        label: 'Concurrency',
        children: [
          { title: 'Overview', file: 'cpp/concurrency/index.html', links: ['cpp/deep-dives/operator-overloading.html', 'cpp/concurrency/threads.html'] },
          {
            name: 'threads-series',
            label: 'Threads',
            children: [
              { title: 'Threads', file: 'cpp/concurrency/threads.html', links: ['cpp/concurrency/index.html', 'cpp/concurrency/threads/creation-lifecycle.html'] },
              { title: 'Creation & Lifecycle', file: 'cpp/concurrency/threads/creation-lifecycle.html', links: ['cpp/concurrency/threads.html', 'cpp/concurrency/threads/passing-arguments.html'] },
              { title: 'Passing Arguments', file: 'cpp/concurrency/threads/passing-arguments.html', links: ['cpp/concurrency/threads/creation-lifecycle.html', 'cpp/concurrency/threads/returning-values.html'] },
              { title: 'Returning Values', file: 'cpp/concurrency/threads/returning-values.html', links: ['cpp/concurrency/threads/passing-arguments.html', 'cpp/concurrency/threads/thread-local-raii.html'] },
              { title: 'Thread-Local & RAII', file: 'cpp/concurrency/threads/thread-local-raii.html', links: ['cpp/concurrency/threads/returning-values.html', 'cpp/concurrency/sharing-data.html'] }
            ]
          },
          { title: 'Sharing Data', file: 'cpp/concurrency/sharing-data.html', links: ['cpp/concurrency/threads.html', 'cpp/concurrency/mutexes.html'] },
          {
            name: 'synchronization-series',
            label: 'Synchronization',
            children: [
              { title: 'Mutexes & Locks', file: 'cpp/concurrency/mutexes.html', links: ['cpp/concurrency/sharing-data.html', 'cpp/concurrency/synchronization/mutex-types.html'] },
              { title: 'Mutex Types', file: 'cpp/concurrency/synchronization/mutex-types.html', links: ['cpp/concurrency/mutexes.html', 'cpp/concurrency/synchronization/lock-guards.html'] },
              { title: 'Lock Guards & Scoped Lock', file: 'cpp/concurrency/synchronization/lock-guards.html', links: ['cpp/concurrency/synchronization/mutex-types.html', 'cpp/concurrency/synchronization/reader-writer.html'] },
              { title: 'Reader-Writer Locks', file: 'cpp/concurrency/synchronization/reader-writer.html', links: ['cpp/concurrency/synchronization/lock-guards.html', 'cpp/concurrency/synchronization/once-flag.html'] },
              { title: 'std::once_flag & call_once', file: 'cpp/concurrency/synchronization/once-flag.html', links: ['cpp/concurrency/synchronization/reader-writer.html', 'cpp/concurrency/deadlocks.html'] }
            ]
          },
          { title: 'Deadlocks & Hazards', file: 'cpp/concurrency/deadlocks.html', links: ['cpp/concurrency/synchronization/once-flag.html', 'cpp/concurrency/condition-variables.html'] },
          {
            name: 'condition-vars-series',
            label: 'Condition Variables',
            children: [
              { title: 'Condition Variables', file: 'cpp/concurrency/condition-variables.html', links: ['cpp/concurrency/deadlocks.html', 'cpp/concurrency/condition-vars/basics.html'] },
              { title: 'CV Basics', file: 'cpp/concurrency/condition-vars/basics.html', links: ['cpp/concurrency/condition-variables.html', 'cpp/concurrency/condition-vars/spurious-wakeups.html'] },
              { title: 'Spurious Wakeups', file: 'cpp/concurrency/condition-vars/spurious-wakeups.html', links: ['cpp/concurrency/condition-vars/basics.html', 'cpp/concurrency/condition-vars/producer-consumer.html'] },
              { title: 'Producer-Consumer', file: 'cpp/concurrency/condition-vars/producer-consumer.html', links: ['cpp/concurrency/condition-vars/spurious-wakeups.html', 'cpp/concurrency/condition-vars/barriers-latches.html'] },
              { title: 'Barriers & Latches', file: 'cpp/concurrency/condition-vars/barriers-latches.html', links: ['cpp/concurrency/condition-vars/producer-consumer.html', 'cpp/concurrency/atomics.html'] }
            ]
          },
          {
            name: 'atomics-series',
            label: 'Atomics',
            children: [
              { title: 'Atomic Operations', file: 'cpp/concurrency/atomics.html', links: ['cpp/concurrency/condition-vars/barriers-latches.html', 'cpp/concurrency/atomics-deep/atomic-types.html'] },
              { title: 'Atomic Types', file: 'cpp/concurrency/atomics-deep/atomic-types.html', links: ['cpp/concurrency/atomics.html', 'cpp/concurrency/atomics-deep/compare-exchange.html'] },
              { title: 'Compare-and-Exchange', file: 'cpp/concurrency/atomics-deep/compare-exchange.html', links: ['cpp/concurrency/atomics-deep/atomic-types.html', 'cpp/concurrency/atomics-deep/fetch-operations.html'] },
              { title: 'Fetch Operations', file: 'cpp/concurrency/atomics-deep/fetch-operations.html', links: ['cpp/concurrency/atomics-deep/compare-exchange.html', 'cpp/concurrency/atomics-deep/wait-notify.html'] },
              { title: 'Wait & Notify (C++20)', file: 'cpp/concurrency/atomics-deep/wait-notify.html', links: ['cpp/concurrency/atomics-deep/fetch-operations.html', 'cpp/concurrency/memory-model.html'] }
            ]
          },
          { title: 'Memory Model', file: 'cpp/concurrency/memory-model.html', links: ['cpp/concurrency/atomics-deep/wait-notify.html', 'cpp/concurrency/futures-promises.html'] },
          {
            name: 'futures-async-series',
            label: 'Futures & Async',
            children: [
              { title: 'Futures & Promises', file: 'cpp/concurrency/futures-promises.html', links: ['cpp/concurrency/memory-model.html', 'cpp/concurrency/futures-async/future-promise.html'] },
              { title: 'Future-Promise Mechanics', file: 'cpp/concurrency/futures-async/future-promise.html', links: ['cpp/concurrency/futures-promises.html', 'cpp/concurrency/futures-async/async-policies.html'] },
              { title: 'Async Launch Policies', file: 'cpp/concurrency/futures-async/async-policies.html', links: ['cpp/concurrency/futures-async/future-promise.html', 'cpp/concurrency/futures-async/packaged-task.html'] },
              { title: 'Packaged Task', file: 'cpp/concurrency/futures-async/packaged-task.html', links: ['cpp/concurrency/futures-async/async-policies.html', 'cpp/concurrency/futures-async/shared-future.html'] },
              { title: 'Shared Future', file: 'cpp/concurrency/futures-async/shared-future.html', links: ['cpp/concurrency/futures-async/packaged-task.html', 'cpp/concurrency/futures-async/exception-propagation.html'] },
              { title: 'Exception Propagation', file: 'cpp/concurrency/futures-async/exception-propagation.html', links: ['cpp/concurrency/futures-async/shared-future.html', 'cpp/concurrency/async.html'] }
            ]
          },
          { title: 'std::async', file: 'cpp/concurrency/async.html', links: ['cpp/concurrency/futures-async/exception-propagation.html', 'cpp/concurrency/thread-pool.html'] },
          {
            name: 'thread-pools-series',
            label: 'Thread Pools',
            children: [
              { title: 'Thread Pools', file: 'cpp/concurrency/thread-pool.html', links: ['cpp/concurrency/async.html', 'cpp/concurrency/thread-pools/basic-pool.html'] },
              { title: 'Basic Thread Pool', file: 'cpp/concurrency/thread-pools/basic-pool.html', links: ['cpp/concurrency/thread-pool.html', 'cpp/concurrency/thread-pools/work-stealing.html'] },
              { title: 'Work Stealing', file: 'cpp/concurrency/thread-pools/work-stealing.html', links: ['cpp/concurrency/thread-pools/basic-pool.html', 'cpp/concurrency/thread-pools/graceful-shutdown.html'] },
              { title: 'Graceful Shutdown', file: 'cpp/concurrency/thread-pools/graceful-shutdown.html', links: ['cpp/concurrency/thread-pools/work-stealing.html', 'cpp/concurrency/thread-pools/async-io-integration.html'] },
              { title: 'Async I/O Integration', file: 'cpp/concurrency/thread-pools/async-io-integration.html', links: ['cpp/concurrency/thread-pools/graceful-shutdown.html', 'cpp/concurrency/lock-free.html'] }
            ]
          },
          {
            name: 'lock-free-series',
            label: 'Lock-Free Programming',
            children: [
              { title: 'Lock-Free Programming', file: 'cpp/concurrency/lock-free.html', links: ['cpp/concurrency/thread-pools/async-io-integration.html', 'cpp/concurrency/lock-free-deep/lock-free-stack.html'] },
              { title: 'Lock-Free Stack', file: 'cpp/concurrency/lock-free-deep/lock-free-stack.html', links: ['cpp/concurrency/lock-free.html', 'cpp/concurrency/lock-free-deep/lock-free-queue.html'] },
              { title: 'Lock-Free Queue', file: 'cpp/concurrency/lock-free-deep/lock-free-queue.html', links: ['cpp/concurrency/lock-free-deep/lock-free-stack.html', 'cpp/concurrency/lock-free-deep/aba-problem.html'] },
              { title: 'ABA Problem', file: 'cpp/concurrency/lock-free-deep/aba-problem.html', links: ['cpp/concurrency/lock-free-deep/lock-free-queue.html', 'cpp/concurrency/lock-free-deep/hazard-pointers.html'] },
              { title: 'Hazard Pointers', file: 'cpp/concurrency/lock-free-deep/hazard-pointers.html', links: ['cpp/concurrency/lock-free-deep/aba-problem.html', 'cpp/concurrency/parallel-algorithms.html'] }
            ]
          },
          {
            name: 'parallel-patterns-series',
            label: 'Parallel Patterns',
            children: [
              { title: 'Parallel Algorithms', file: 'cpp/concurrency/parallel-algorithms.html', links: ['cpp/concurrency/lock-free-deep/hazard-pointers.html', 'cpp/concurrency/parallel-patterns/fork-join.html'] },
              { title: 'Fork-Join', file: 'cpp/concurrency/parallel-patterns/fork-join.html', links: ['cpp/concurrency/parallel-algorithms.html', 'cpp/concurrency/parallel-patterns/map-reduce.html'] },
              { title: 'Map-Reduce', file: 'cpp/concurrency/parallel-patterns/map-reduce.html', links: ['cpp/concurrency/parallel-patterns/fork-join.html', 'cpp/concurrency/parallel-patterns/pipeline.html'] },
              { title: 'Pipeline Pattern', file: 'cpp/concurrency/parallel-patterns/pipeline.html', links: ['cpp/concurrency/parallel-patterns/map-reduce.html', 'cpp/concurrency/parallel-patterns/actor-model.html'] },
              { title: 'Actor Model', file: 'cpp/concurrency/parallel-patterns/actor-model.html', links: ['cpp/concurrency/parallel-patterns/pipeline.html', 'cpp/concurrency/coroutines.html'] }
            ]
          },
          { title: 'Coroutines', file: 'cpp/concurrency/coroutines.html', links: ['cpp/concurrency/parallel-patterns/actor-model.html', 'cpp/concurrency/patterns.html'] },
          { title: 'Concurrency Patterns', file: 'cpp/concurrency/patterns.html', links: ['cpp/concurrency/coroutines.html'] }
        ]
      }
    ]
  },
  {
    name: 'dsa',
    label: 'DSA Series',
    children: [
      {
        name: 'trees',
        label: 'Trees',
        children: [
          { title: 'Introduction', file: 'dsa/trees/intro.html', links: ['dsa/trees/traversals/index.html'] },
          {
            name: 'traversals',
            label: 'Traversals',
            children: [
              { title: 'Tree Traversals', file: 'dsa/trees/traversals/index.html', links: ['dsa/trees/intro.html', 'dsa/trees/bst/index.html'] }
            ]
          },
          {
            name: 'bst',
            label: 'Binary Search Trees',
            children: [
              { title: 'BST', file: 'dsa/trees/bst/index.html', links: ['dsa/trees/traversals/index.html', 'dsa/trees/bst/iterator.html'] },
              { title: 'BST Iterator', file: 'dsa/trees/bst/iterator.html', links: ['dsa/trees/bst/index.html', 'dsa/trees/avl/index.html'] }
            ]
          },
          {
            name: 'avl',
            label: 'AVL Trees',
            children: [
              { title: 'AVL Overview', file: 'dsa/trees/avl/index.html', links: ['dsa/trees/bst/index.html', 'dsa/trees/avl/rotations.html'] },
              { title: 'Rotations', file: 'dsa/trees/avl/rotations.html', links: ['dsa/trees/avl/index.html', 'dsa/trees/avl/insertdelete.html'] },
              { title: 'Insert & Delete', file: 'dsa/trees/avl/insertdelete.html', links: ['dsa/trees/avl/rotations.html', 'dsa/trees/avl/patterns.html'] },
              { title: 'Analysis & Patterns', file: 'dsa/trees/avl/patterns.html', links: ['dsa/trees/avl/insertdelete.html', 'dsa/trees/heap/index.html'] }
            ]
          },
          {
            name: 'heap',
            label: 'Binary Heaps',
            children: [
              { title: 'Binary Heaps & Priority Queues', file: 'dsa/trees/heap/index.html', links: ['dsa/trees/avl/patterns.html', 'dsa/trees/segment-tree/intro.html'] }
            ]
          },
          {
            name: 'segment-tree',
            label: 'Segment Trees',
            children: [
              { title: 'Introduction', file: 'dsa/trees/segment-tree/intro.html', links: ['dsa/trees/heap/index.html', 'dsa/trees/segment-tree/build-query.html'] },
              { title: 'Building & Querying', file: 'dsa/trees/segment-tree/build-query.html', links: ['dsa/trees/segment-tree/intro.html', 'dsa/trees/segment-tree/updates.html'] },
              { title: 'Updates', file: 'dsa/trees/segment-tree/updates.html', links: ['dsa/trees/segment-tree/build-query.html', 'dsa/trees/segment-tree/lazy.html'] },
              { title: 'Lazy Propagation', file: 'dsa/trees/segment-tree/lazy.html', links: ['dsa/trees/segment-tree/updates.html', 'dsa/trees/segment-tree/patterns.html'] },
              { title: 'Patterns & Practice', file: 'dsa/trees/segment-tree/patterns.html', links: ['dsa/trees/segment-tree/lazy.html', 'dsa/trees/fenwick-tree/intro.html'] }
            ]
          },
          {
            name: 'fenwick-tree',
            label: 'Fenwick Trees',
            children: [
              { title: 'Introduction', file: 'dsa/trees/fenwick-tree/intro.html', links: ['dsa/trees/segment-tree/patterns.html', 'dsa/trees/fenwick-tree/structure.html'] },
              { title: 'Structure & lowbit', file: 'dsa/trees/fenwick-tree/structure.html', links: ['dsa/trees/fenwick-tree/intro.html', 'dsa/trees/fenwick-tree/point-query.html'] },
              { title: 'Point Updates & Queries', file: 'dsa/trees/fenwick-tree/point-query.html', links: ['dsa/trees/fenwick-tree/structure.html', 'dsa/trees/fenwick-tree/range-operations.html'] },
              { title: 'Range Operations', file: 'dsa/trees/fenwick-tree/range-operations.html', links: ['dsa/trees/fenwick-tree/point-query.html', 'dsa/trees/fenwick-tree/patterns.html'] },
              { title: 'Patterns & Practice', file: 'dsa/trees/fenwick-tree/patterns.html', links: ['dsa/trees/fenwick-tree/range-operations.html', 'dsa/trees/algorithms/index.html'] }
            ]
          },
          {
            name: 'algorithms',
            label: 'Algorithms & Patterns',
            children: [
              { title: 'Overview', file: 'dsa/trees/algorithms/index.html', links: ['dsa/trees/avl/index.html', 'dsa/trees/algorithms/height.html'] },
              { title: 'Height', file: 'dsa/trees/algorithms/height.html', links: ['dsa/trees/algorithms/index.html', 'dsa/trees/algorithms/lca.html'] },
              { title: 'LCA', file: 'dsa/trees/algorithms/lca.html', links: ['dsa/trees/algorithms/height.html', 'dsa/trees/algorithms/diameter.html'] },
              { title: 'Diameter', file: 'dsa/trees/algorithms/diameter.html', links: ['dsa/trees/algorithms/lca.html', 'dsa/trees/algorithms/serialize.html'] },
              { title: 'Serialization', file: 'dsa/trees/algorithms/serialize.html', links: ['dsa/trees/algorithms/diameter.html', 'dsa/trees/algorithms/patterns.html'] },
              { title: 'Interview Patterns', file: 'dsa/trees/algorithms/patterns.html', links: ['dsa/trees/algorithms/serialize.html', 'dsa/trees/threaded/intro.html'] }
            ]
          },
          {
            name: 'threaded',
            label: 'Threaded Trees',
            children: [
              { title: 'Introduction', file: 'dsa/trees/threaded/intro.html', links: ['dsa/trees/algorithms/index.html', 'dsa/trees/threaded/construction.html'] },
              { title: 'Construction', file: 'dsa/trees/threaded/construction.html', links: ['dsa/trees/threaded/intro.html', 'dsa/trees/threaded/traversal.html'] },
              { title: 'Traversal', file: 'dsa/trees/threaded/traversal.html', links: ['dsa/trees/threaded/construction.html', 'dsa/trees/threaded/morris.html'] },
              { title: 'Morris Traversal', file: 'dsa/trees/threaded/morris.html', links: ['dsa/trees/threaded/traversal.html', 'dsa/trees/threaded/morris-postorder.html'] },
              { title: 'Morris Post-order', file: 'dsa/trees/threaded/morris-postorder.html', links: ['dsa/trees/threaded/morris.html', 'dsa/trees/threaded/morris-complexity.html'] },
              { title: 'Morris Complexity', file: 'dsa/trees/threaded/morris-complexity.html', links: ['dsa/trees/threaded/morris-postorder.html', 'dsa/trees/threaded/patterns.html'] },
              { title: 'Patterns & Practice', file: 'dsa/trees/threaded/patterns.html', links: ['dsa/trees/threaded/morris-complexity.html', 'dsa/trees/veb-tree/index.html'] }
            ]
          },
          {
            name: 'veb-tree',
            label: 'Van Emde Boas Trees',
            children: [
              { title: 'Overview', file: 'dsa/trees/veb-tree/index.html', links: ['dsa/trees/threaded/patterns.html', 'dsa/trees/veb-tree/intro.html'] },
              { title: 'The Predecessor Problem', file: 'dsa/trees/veb-tree/intro.html', links: ['dsa/trees/veb-tree/index.html', 'dsa/trees/veb-tree/structure.html'] },
              { title: 'The Recursive Structure', file: 'dsa/trees/veb-tree/structure.html', links: ['dsa/trees/veb-tree/intro.html', 'dsa/trees/veb-tree/operations.html'] },
              { title: 'Operations', file: 'dsa/trees/veb-tree/operations.html', links: ['dsa/trees/veb-tree/structure.html', 'dsa/trees/veb-tree/patterns.html'] },
              { title: 'Analysis & Patterns', file: 'dsa/trees/veb-tree/patterns.html', links: ['dsa/trees/veb-tree/operations.html', 'dsa/trees/b-tree/index.html'] }
            ]
          },
          {
            name: 'b-tree',
            label: 'B-Trees',
            children: [
              { title: 'B-Trees Overview', file: 'dsa/trees/b-tree/index.html', links: ['dsa/trees/veb-tree/patterns.html', 'dsa/trees/b-tree/operations.html'] },
              { title: 'Operations', file: 'dsa/trees/b-tree/operations.html', links: ['dsa/trees/b-tree/index.html', 'dsa/trees/b-tree/patterns.html'] },
              { title: 'Patterns & Analysis', file: 'dsa/trees/b-tree/patterns.html', links: ['dsa/trees/b-tree/operations.html', 'dsa/trees/b-plus-tree/index.html'] }
            ]
          },
          {
            name: 'b-plus-tree',
            label: 'B+ Trees',
            children: [
              { title: 'B+ Trees Overview', file: 'dsa/trees/b-plus-tree/index.html', links: ['dsa/trees/b-tree/patterns.html', 'dsa/trees/b-plus-tree/operations.html'] },
              { title: 'Operations', file: 'dsa/trees/b-plus-tree/operations.html', links: ['dsa/trees/b-plus-tree/index.html', 'dsa/trees/b-plus-tree/patterns.html'] },
              { title: 'Patterns & Real-World', file: 'dsa/trees/b-plus-tree/patterns.html', links: ['dsa/trees/b-plus-tree/operations.html', 'dsa/trees/trie/index.html'] }
            ]
          },
          {
            name: 'trie',
            label: 'Tries',
            children: [
              { title: 'Tries Overview', file: 'dsa/trees/trie/index.html', links: ['dsa/trees/b-plus-tree/patterns.html', 'dsa/trees/trie/operations.html'] },
              { title: 'Operations', file: 'dsa/trees/trie/operations.html', links: ['dsa/trees/trie/index.html', 'dsa/trees/trie/variants.html'] },
              { title: 'Variants', file: 'dsa/trees/trie/variants.html', links: ['dsa/trees/trie/operations.html', 'dsa/trees/trie/patterns.html'] },
              { title: 'Patterns & Interview', file: 'dsa/trees/trie/patterns.html', links: ['dsa/trees/trie/variants.html', 'dsa/trees/red-black/index.html'] }
            ]
          },
          {
            name: 'red-black',
            label: 'Red-Black Trees',
            children: [
              { title: 'Properties & Intuition', file: 'dsa/trees/red-black/index.html', links: ['dsa/trees/trie/patterns.html', 'dsa/trees/red-black/insertion.html'] },
              { title: 'Insertion', file: 'dsa/trees/red-black/insertion.html', links: ['dsa/trees/red-black/index.html', 'dsa/trees/red-black/deletion.html'] },
              { title: 'Deletion', file: 'dsa/trees/red-black/deletion.html', links: ['dsa/trees/red-black/insertion.html', 'dsa/trees/red-black/patterns.html'] },
              { title: 'Analysis & Patterns', file: 'dsa/trees/red-black/patterns.html', links: ['dsa/trees/red-black/deletion.html', 'dsa/trees/serialization/index.html'] }
            ]
          },
          {
            name: 'serialization',
            label: 'Serialization',
            children: [
              { title: 'Overview', file: 'dsa/trees/serialization/index.html', links: ['dsa/trees/red-black/patterns.html', 'dsa/trees/serialization/preorder.html'] },
              { title: 'Preorder Serialization', file: 'dsa/trees/serialization/preorder.html', links: ['dsa/trees/serialization/index.html', 'dsa/trees/serialization/level-order.html'] },
              { title: 'Level-Order Serialization', file: 'dsa/trees/serialization/level-order.html', links: ['dsa/trees/serialization/preorder.html', 'dsa/trees/serialization/advanced.html'] },
              { title: 'Advanced Techniques', file: 'dsa/trees/serialization/advanced.html', links: ['dsa/trees/serialization/level-order.html', 'dsa/trees/serialization/patterns.html'] },
              { title: 'Interview Patterns', file: 'dsa/trees/serialization/patterns.html', links: ['dsa/trees/serialization/advanced.html'] }
            ]
          }
        ]
      },
      {
        name: 'arrays',
        label: 'Arrays',
        children: [
          {
            name: 'prefix-sum',
            label: 'Prefix Sum',
            children: [
              { title: 'Fundamentals', file: 'dsa/arrays/prefix-sum/index.html', links: ['dsa/arrays/prefix-sum/patterns.html'] },
              { title: 'Patterns', file: 'dsa/arrays/prefix-sum/patterns.html', links: ['dsa/arrays/prefix-sum/index.html', 'dsa/arrays/prefix-sum/advanced.html'] },
              { title: '2D & Advanced', file: 'dsa/arrays/prefix-sum/advanced.html', links: ['dsa/arrays/prefix-sum/patterns.html', 'dsa/trees/segment-tree/intro.html'] }
            ]
          },
          {
            name: 'two-pointers',
            label: 'Two Pointers',
            children: [
              { title: 'Overview', file: 'dsa/arrays/two-pointers/index.html', links: ['dsa/arrays/two-pointers/opposite-ends.html'] },
              { title: 'Opposite-End Pointers', file: 'dsa/arrays/two-pointers/opposite-ends.html', links: ['dsa/arrays/two-pointers/index.html', 'dsa/arrays/two-pointers/same-direction.html'] },
              { title: 'Same-Direction Pointers', file: 'dsa/arrays/two-pointers/same-direction.html', links: ['dsa/arrays/two-pointers/opposite-ends.html', 'dsa/arrays/two-pointers/patterns.html'] },
              { title: 'Competition Patterns', file: 'dsa/arrays/two-pointers/patterns.html', links: ['dsa/arrays/two-pointers/same-direction.html'] }
            ]
          },
          {
            name: 'sliding-window',
            label: 'Sliding Window',
            children: [
              { title: 'Overview', file: 'dsa/arrays/sliding-window/index.html', links: ['dsa/arrays/sliding-window/fixed-size.html'] },
              { title: 'Fixed-Size Window', file: 'dsa/arrays/sliding-window/fixed-size.html', links: ['dsa/arrays/sliding-window/index.html', 'dsa/arrays/sliding-window/variable-size.html'] },
              { title: 'Variable-Size Window', file: 'dsa/arrays/sliding-window/variable-size.html', links: ['dsa/arrays/sliding-window/fixed-size.html', 'dsa/arrays/sliding-window/patterns.html'] },
              { title: 'Competition Patterns', file: 'dsa/arrays/sliding-window/patterns.html', links: ['dsa/arrays/sliding-window/variable-size.html'] }
            ]
          },
          {
            name: 'kadanes-algorithm',
            label: 'Kadanes Algorithm',
            children: [
              { title: 'Overview', file: 'dsa/arrays/kadanes-algorithm/index.html', links: ['dsa/arrays/kadanes-algorithm/variants.html'] },
              { title: 'Variants', file: 'dsa/arrays/kadanes-algorithm/variants.html', links: ['dsa/arrays/kadanes-algorithm/index.html', 'dsa/arrays/kadanes-algorithm/patterns.html'] },
              { title: 'Competition Patterns', file: 'dsa/arrays/kadanes-algorithm/patterns.html', links: ['dsa/arrays/kadanes-algorithm/variants.html'] }
            ]
          },
          {
            name: 'binary-search',
            label: 'Binary Search',
            children: [
              { title: 'Fundamentals', file: 'dsa/arrays/binary-search/index.html', links: ['dsa/arrays/binary-search/advanced.html'] },
              { title: 'Advanced', file: 'dsa/arrays/binary-search/advanced.html', links: ['dsa/arrays/binary-search/index.html', 'dsa/arrays/binary-search/patterns.html'] },
              { title: 'Competition Patterns', file: 'dsa/arrays/binary-search/patterns.html', links: ['dsa/arrays/binary-search/advanced.html'] }
            ]
          },
          {
            name: 'sorting-techniques',
            label: 'Sorting Techniques',
            children: [
              { title: 'Overview', file: 'dsa/arrays/sorting-techniques/index.html', links: ['dsa/arrays/sorting-techniques/comparison-sorts.html'] },
              { title: 'Comparison Sorts', file: 'dsa/arrays/sorting-techniques/comparison-sorts.html', links: ['dsa/arrays/sorting-techniques/index.html', 'dsa/arrays/sorting-techniques/linear-sorts.html'] },
              { title: 'Linear Time Sorts', file: 'dsa/arrays/sorting-techniques/linear-sorts.html', links: ['dsa/arrays/sorting-techniques/comparison-sorts.html', 'dsa/arrays/sorting-techniques/patterns.html'] },
              { title: 'Competition Patterns', file: 'dsa/arrays/sorting-techniques/patterns.html', links: ['dsa/arrays/sorting-techniques/linear-sorts.html'] }
            ]
          },
          {
            name: 'merge-intervals',
            label: 'Merge Intervals',
            children: [
              { title: 'Overview', file: 'dsa/arrays/merge-intervals/index.html', links: ['dsa/arrays/merge-intervals/patterns.html'] },
              { title: 'Interval Patterns', file: 'dsa/arrays/merge-intervals/patterns.html', links: ['dsa/arrays/merge-intervals/index.html'] }
            ]
          },
          {
            name: 'dutch-national-flag',
            label: 'Dutch National Flag',
            children: [
              { title: 'Overview', file: 'dsa/arrays/dutch-national-flag/index.html', links: ['dsa/arrays/dutch-national-flag/patterns.html'] },
              { title: 'Patterns', file: 'dsa/arrays/dutch-national-flag/patterns.html', links: ['dsa/arrays/dutch-national-flag/index.html'] }
            ]
          },
          {
            name: 'matrix',
            label: 'Matrix',
            children: [
              { title: 'Fundamentals', file: 'dsa/arrays/matrix/index.html', links: ['dsa/arrays/matrix/patterns.html'] },
              { title: 'Matrix Patterns', file: 'dsa/arrays/matrix/patterns.html', links: ['dsa/arrays/matrix/index.html'] }
            ]
          },
          {
            name: 'hashing',
            label: 'Hashing',
            children: [
              { title: 'Fundamentals', file: 'dsa/arrays/hashing/index.html', links: ['dsa/arrays/hashing/patterns.html'] },
              { title: 'Hashing Patterns', file: 'dsa/arrays/hashing/patterns.html', links: ['dsa/arrays/hashing/index.html'] }
            ]
          },
          {
            name: 'subarray-problems',
            label: 'Subarray Problems',
            children: [
              { title: 'Overview', file: 'dsa/arrays/subarray-problems/index.html', links: ['dsa/arrays/subarray-problems/patterns.html'] },
              { title: 'Subarray Patterns', file: 'dsa/arrays/subarray-problems/patterns.html', links: ['dsa/arrays/subarray-problems/index.html'] }
            ]
          },
          {
            name: 'greedy-on-arrays',
            label: 'Greedy on Arrays',
            children: [
              { title: 'Overview', file: 'dsa/arrays/greedy-on-arrays/index.html', links: ['dsa/arrays/greedy-on-arrays/patterns.html'] },
              { title: 'Greedy Patterns', file: 'dsa/arrays/greedy-on-arrays/patterns.html', links: ['dsa/arrays/greedy-on-arrays/index.html'] }
            ]
          },
          {
            name: 'cyclic-sort',
            label: 'Cyclic Sort',
            children: [
              { title: 'Fundamentals', file: 'dsa/arrays/cyclic-sort/index.html', links: ['dsa/arrays/cyclic-sort/patterns.html'] },
              { title: 'Patterns', file: 'dsa/arrays/cyclic-sort/patterns.html', links: ['dsa/arrays/cyclic-sort/index.html'] }
            ]
          },
          {
            name: 'next-permutation',
            label: 'Next Permutation',
            children: [
              { title: 'Next Permutation', file: 'dsa/arrays/next-permutation/index.html' }
            ]
          },
          {
            name: 'stock-problems',
            label: 'Stock Problems',
            children: [
              { title: 'Stock Problems', file: 'dsa/arrays/stock-problems/index.html' }
            ]
          },
          {
            name: 'trapping-rain-water',
            label: 'Trapping Rain Water',
            children: [
              { title: 'Trapping Rain Water', file: 'dsa/arrays/trapping-rain-water/index.html' }
            ]
          }
        ]
      },
      {
        name: 'complexity',
        label: 'Time & Space Complexity',
        children: [
          { title: 'Overview', file: 'dsa/complexity/index.html', links: ['dsa/complexity/intro.html'] },
          { title: 'Introduction to Big-O', file: 'dsa/complexity/intro.html', links: ['dsa/complexity/index.html', 'dsa/complexity/asymptotic.html'] },
          { title: 'Asymptotic Notation', file: 'dsa/complexity/asymptotic.html', links: ['dsa/complexity/intro.html', 'dsa/complexity/common.html'] },
          { title: 'Common Complexities', file: 'dsa/complexity/common.html', links: ['dsa/complexity/asymptotic.html', 'dsa/complexity/recursion.html'] },
          { title: 'Recurrence Relations', file: 'dsa/complexity/recursion.html', links: ['dsa/complexity/common.html', 'dsa/complexity/amortized.html'] },
          { title: 'Amortized Analysis', file: 'dsa/complexity/amortized.html', links: ['dsa/complexity/recursion.html', 'dsa/complexity/space.html'] },
          { title: 'Space Complexity', file: 'dsa/complexity/space.html', links: ['dsa/complexity/amortized.html', 'dsa/complexity/logarithmic.html'] },
          { title: 'Why Logarithms Appear', file: 'dsa/complexity/logarithmic.html', links: ['dsa/complexity/space.html', 'dsa/complexity/sorting.html'] },
          { title: 'Sorting Lower Bounds', file: 'dsa/complexity/sorting.html', links: ['dsa/complexity/logarithmic.html', 'dsa/complexity/patterns.html'] },
          { title: 'Complexity Patterns', file: 'dsa/complexity/patterns.html', links: ['dsa/complexity/sorting.html'] }
        ]
      },
      {
        name: 'bit-manipulation',
        label: 'Bit Manipulation',
        children: [
          { title: 'Overview', file: 'dsa/bit-manipulation/index.html', links: ['dsa/complexity/patterns.html', 'dsa/bit-manipulation/binary-representation.html'] },
          { title: 'Binary Representation', file: 'dsa/bit-manipulation/binary-representation.html', links: ['dsa/bit-manipulation/index.html', 'dsa/bit-manipulation/basic-operations.html'] },
          { title: 'Bitwise Operators', file: 'dsa/bit-manipulation/basic-operations.html', links: ['dsa/bit-manipulation/binary-representation.html', 'dsa/bit-manipulation/common-tricks.html'] },
          { title: 'Essential Tricks', file: 'dsa/bit-manipulation/common-tricks.html', links: ['dsa/bit-manipulation/basic-operations.html', 'dsa/bit-manipulation/bit-masks.html'] },
          { title: 'Bit Masks', file: 'dsa/bit-manipulation/bit-masks.html', links: ['dsa/bit-manipulation/common-tricks.html', 'dsa/bit-manipulation/counting-bits.html'] },
          { title: 'Counting Bits', file: 'dsa/bit-manipulation/counting-bits.html', links: ['dsa/bit-manipulation/bit-masks.html', 'dsa/bit-manipulation/power-of-two.html'] },
          { title: 'Powers of Two', file: 'dsa/bit-manipulation/power-of-two.html', links: ['dsa/bit-manipulation/counting-bits.html', 'dsa/bit-manipulation/xor-patterns.html'] },
          { title: 'XOR Patterns', file: 'dsa/bit-manipulation/xor-patterns.html', links: ['dsa/bit-manipulation/power-of-two.html', 'dsa/bit-manipulation/bit-shifting.html'] },
          { title: 'Bit Shifting', file: 'dsa/bit-manipulation/bit-shifting.html', links: ['dsa/bit-manipulation/xor-patterns.html', 'dsa/bit-manipulation/bitwise-dp.html'] },
          { title: 'Bitmask DP', file: 'dsa/bit-manipulation/bitwise-dp.html', links: ['dsa/bit-manipulation/bit-shifting.html', 'dsa/bit-manipulation/interview-patterns.html'] },
          { title: 'Interview Patterns', file: 'dsa/bit-manipulation/interview-patterns.html', links: ['dsa/bit-manipulation/bitwise-dp.html'] }
        ]
      },
      {
        name: 'graphs',
        label: 'Graphs',
        children: [
          {
            name: 'traversal',
            label: 'Traversal',
            children: [
              { title: 'Overview', file: 'dsa/graphs/traversal/index.html', links: ['dsa/graphs/traversal/bfs.html'] },
              { title: 'BFS In Depth', file: 'dsa/graphs/traversal/bfs.html', links: ['dsa/graphs/traversal/index.html', 'dsa/graphs/traversal/dfs.html'] },
              { title: 'DFS In Depth', file: 'dsa/graphs/traversal/dfs.html', links: ['dsa/graphs/traversal/bfs.html', 'dsa/graphs/traversal/multi-source-bfs.html'] },
              { title: 'Multi-source BFS', file: 'dsa/graphs/traversal/multi-source-bfs.html', links: ['dsa/graphs/traversal/dfs.html', 'dsa/graphs/traversal/dfs-applications.html'] },
              { title: 'DFS Applications', file: 'dsa/graphs/traversal/dfs-applications.html', links: ['dsa/graphs/traversal/multi-source-bfs.html'] }
            ]
          },
          {
            name: 'cycle-detection',
            label: 'Cycle Detection',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/cycle-detection/index.html' }
            ]
          },
          {
            name: 'topological-sort',
            label: 'Topological Sort',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/topological-sort/index.html' }
            ]
          },
          {
            name: 'shortest-path',
            label: 'Shortest Path',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/shortest-path/index.html' }
            ]
          },
          {
            name: 'dijkstra',
            label: 'Dijkstra',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/dijkstra/index.html' }
            ]
          },
          {
            name: 'bellman-ford',
            label: 'Bellman Ford',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/bellman-ford/index.html' }
            ]
          },
          {
            name: 'floyd-warshall',
            label: 'Floyd Warshall',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/floyd-warshall/index.html' }
            ]
          },
          {
            name: 'disjoint-set-union',
            label: 'Disjoint Set Union',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/disjoint-set-union/index.html' }
            ]
          },
          {
            name: 'minimum-spanning-tree',
            label: 'Minimum Spanning Tree',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/minimum-spanning-tree/index.html' }
            ]
          },
          {
            name: 'bipartite',
            label: 'Bipartite',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/bipartite/index.html' }
            ]
          },
          {
            name: 'strongly-connected-components',
            label: 'Strongly Connected Components',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/strongly-connected-components/index.html' }
            ]
          },
          {
            name: 'bridges-articulation-points',
            label: 'Bridges & Articulation Points',
            children: [
              { title: 'Overview', file: 'dsa/graphs/bridges-articulation-points/index.html' },
              { title: "Tarjan's Bridge Detection", file: 'dsa/graphs/bridges-articulation-points/bridges-algorithm.html' },
              { title: 'Finding Articulation Points', file: 'dsa/graphs/bridges-articulation-points/articulation-points.html' },
              { title: 'Applications', file: 'dsa/graphs/bridges-articulation-points/applications.html' }
            ]
          },
          {
            name: 'euler-path',
            label: 'Euler Path',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/euler-path/index.html' }
            ]
          },
          {
            name: 'network-flow',
            label: 'Network Flow',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/network-flow/index.html' }
            ]
          },
          {
            name: 'graph-coloring',
            label: 'Graph Coloring',
            children: [
              { title: 'Coming Soon', file: 'dsa/graphs/graph-coloring/index.html' }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'lld',
    label: 'Low Level Design',
    children: [
      { title: 'Introduction', file: 'lld/intro.html', links: ['lld/design-patterns.html'] },
      { title: 'Design Patterns', file: 'lld/design-patterns.html', links: ['lld/intro.html', 'lld/parking-lot.html'] },
      { title: 'Design: Parking Lot', file: 'lld/parking-lot.html', links: ['lld/design-patterns.html', 'lld/elevator.html'] },
      { title: 'Design: Elevator System', file: 'lld/elevator.html', links: ['lld/parking-lot.html', 'lld/splitwise.html'] },
      { title: 'Design: Splitwise', file: 'lld/splitwise.html', links: ['lld/elevator.html', 'lld/patterns.html'] },
      { title: 'Interview Patterns', file: 'lld/patterns.html', links: ['lld/splitwise.html'] }
    ]
  },
  {
    name: 'ml',
    label: 'Machine Learning',
    children: [
      {
        name: 'transformers',
        label: 'Transformers',
        children: [
          { title: 'Overview', file: 'ml/transformers/index.html' },
          {
            name: 'attention',
            label: 'Attention Mechanism',
            children: [
              { title: 'Self-Attention', file: 'ml/transformers/attention/index.html' },
              { title: 'Multi-Head Attention', file: 'ml/transformers/attention/multi-head.html' },
              { title: 'Scaled Dot-Product', file: 'ml/transformers/attention/scaled-dot.html' }
            ]
          },
          {
            name: 'architecture',
            label: 'Architecture',
            children: [
              { title: 'Encoder-Decoder Overview', file: 'ml/transformers/architecture/index.html' },
              { title: 'Encoder Block', file: 'ml/transformers/architecture/encoder.html' },
              { title: 'Decoder Block', file: 'ml/transformers/architecture/decoder.html' },
              { title: 'Positional Encoding', file: 'ml/transformers/architecture/positional-encoding.html' }
            ]
          },
          {
            name: 'training',
            label: 'Training',
            children: [
              { title: 'Training Overview', file: 'ml/transformers/training/index.html' },
              { title: 'Tokenization', file: 'ml/transformers/training/tokenization.html' },
              { title: 'Normalization', file: 'ml/transformers/training/normalization.html' }
            ]
          },
          {
            name: 'variants',
            label: 'Variants',
            children: [
              { title: 'Landscape', file: 'ml/transformers/variants/index.html' },
              { title: 'BERT', file: 'ml/transformers/variants/bert.html' },
              { title: 'GPT', file: 'ml/transformers/variants/gpt.html' },
              { title: 'Vision Transformer', file: 'ml/transformers/variants/vision.html' }
            ]
          },
          {
            name: 'from-scratch',
            label: 'From Scratch',
            children: [
              { title: 'Overview', file: 'ml/transformers/from-scratch/index.html' },
              {
                name: 'cpp',
                label: 'C++ Implementation',
                children: [
                  { title: 'Coming Soon', file: 'ml/transformers/from-scratch/cpp/index.html' }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

/* ===== Helper: flatten tree for graph ===== */
function flattenBlogTree(nodes, result) {
  nodes.forEach(function(node) {
    if (node.file) {
      result.push(node);
    }
    if (node.children) {
      flattenBlogTree(node.children, result);
    }
  });
  return result;
}

/* ===== Code-editor style file tree navigation ===== */
(function buildBlogNav() {
  var nav = document.querySelector('.blog-nav');
  if (!nav) return;

  var path = window.location.pathname;
  var inBlogDir = path.indexOf('/blog/') !== -1;
  /* Compute the file path relative to /blog/ */
  var blogIdx = path.indexOf('/blog/');
  var currentRelative = blogIdx !== -1 ? path.substring(blogIdx + 6) : '';

  /* prefix for links: from blog index page use 'blog/', from within blog dirs compute relative */
  function getHref(file) {
    if (!inBlogDir) return 'blog/' + file;
    /* Compute relative path from current page to target file */
    var curParts = currentRelative.split('/');
    curParts.pop(); /* remove filename */
    var tgtParts = file.split('/');
    /* Find common prefix */
    var common = 0;
    while (common < curParts.length && common < tgtParts.length - 1 && curParts[common] === tgtParts[common]) {
      common++;
    }
    var up = curParts.length - common;
    var rel = '';
    for (var i = 0; i < up; i++) rel += '../';
    rel += tgtParts.slice(common).join('/');
    return rel || tgtParts[tgtParts.length - 1];
  }

  var heading = document.createElement('h4');
  heading.textContent = 'Explorer';
  nav.appendChild(heading);

  function buildLevel(items, container, depth) {
    items.forEach(function(item) {
      if (item.children) {
        /* Folder node */
        var folder = document.createElement('div');
        folder.className = 'file-tree-folder';
        folder.style.paddingLeft = (depth * 12) + 'px';

        var btn = document.createElement('button');
        btn.className = 'file-tree-toggle';
        btn.innerHTML = '<span class="ft-chevron">&#9654;</span>' +
          '<span class="ft-icon ft-folder">&#128193;</span>' +
          '<span class="ft-label">' + item.label + '</span>';

        var childContainer = document.createElement('div');
        childContainer.className = 'file-tree-children';

        /* Check if any child is active to auto-expand */
        var hasActive = false;
        (function checkActive(nodes) {
          nodes.forEach(function(n) {
            if (n.file && currentRelative === n.file) hasActive = true;
            if (n.children) checkActive(n.children);
          });
        })(item.children);

        if (hasActive) {
          btn.classList.add('open');
          childContainer.classList.add('open');
        }

        btn.addEventListener('click', function() {
          btn.classList.toggle('open');
          childContainer.classList.toggle('open');
        });

        folder.appendChild(btn);
        container.appendChild(folder);
        container.appendChild(childContainer);
        buildLevel(item.children, childContainer, depth + 1);
      } else {
        /* File (leaf) node */
        var fileEl = document.createElement('a');
        fileEl.className = 'file-tree-file';
        fileEl.style.paddingLeft = (depth * 12 + 8) + 'px';
        fileEl.href = getHref(item.file);
        var ext = item.file.split('.').pop();
        var icon = ext === 'html' ? '&#128196;' : '&#128196;';
        fileEl.innerHTML = '<span class="ft-icon ft-file">' + icon + '</span>' +
          '<span class="ft-label">' + item.title + '</span>';

        if (currentRelative === item.file) {
          fileEl.classList.add('active');
        }
        container.appendChild(fileEl);
      }
    });
  }

  buildLevel(BLOG_TREE, nav, 0);
})();

/* Blog post: auto-generate TOC from headings */
(function buildTOC() {
  const sidebar = document.querySelector('.toc-section ul');
  const content = document.querySelector('.blog-post-content');
  if (!sidebar || !content) return;

  const headings = content.querySelectorAll('h2, h3');
  headings.forEach((h, i) => {
    if (!h.id) h.id = 'section-' + i;
    const li = document.createElement('li');
    if (h.tagName === 'H3') li.classList.add('depth-3');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    sidebar.appendChild(li);
  });

  /* Scroll spy */
  const tocLinks = sidebar.querySelectorAll('a');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('active'));
        const active = sidebar.querySelector('a[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });

  headings.forEach(h => obs.observe(h));
})();

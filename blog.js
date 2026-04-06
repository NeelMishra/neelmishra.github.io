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
          },
          {
            name: 'lca',
            label: 'Lowest Common Ancestor',
            children: [
              { title: 'LCA — Binary Lifting & RMQ', file: 'dsa/trees/lca/index.html', links: ['dsa/trees/algorithms/lca.html', 'dsa/trees/euler-tour/index.html'] }
            ]
          },
          {
            name: 'euler-tour',
            label: 'Euler Tour Technique',
            children: [
              { title: 'Tree Flattening', file: 'dsa/trees/euler-tour/index.html', links: ['dsa/trees/lca/index.html', 'dsa/trees/hld/index.html'] }
            ]
          },
          {
            name: 'hld',
            label: 'Heavy-Light Decomposition',
            children: [
              { title: 'HLD & Path Queries', file: 'dsa/trees/hld/index.html', links: ['dsa/trees/euler-tour/index.html', 'dsa/trees/centroid-decomposition/index.html'] }
            ]
          },
          {
            name: 'centroid-decomposition',
            label: 'Centroid Decomposition',
            children: [
              { title: 'Divide & Conquer on Trees', file: 'dsa/trees/centroid-decomposition/index.html', links: ['dsa/trees/hld/index.html', 'dsa/trees/tree-dp/index.html'] }
            ]
          },
          {
            name: 'tree-dp',
            label: 'Tree DP',
            children: [
              { title: 'DP on Trees & Rerooting', file: 'dsa/trees/tree-dp/index.html', links: ['dsa/trees/centroid-decomposition/index.html', 'dsa/trees/persistent-segment-tree/index.html'] }
            ]
          },
          {
            name: 'persistent-segment-tree',
            label: 'Persistent Segment Tree',
            children: [
              { title: 'Persistent Segment Trees', file: 'dsa/trees/persistent-segment-tree/index.html', links: ['dsa/trees/segment-tree/lazy.html', 'dsa/trees/treap/index.html'] }
            ]
          },
          {
            name: 'treap',
            label: 'Treaps',
            children: [
              { title: 'Treaps & Implicit Treaps', file: 'dsa/trees/treap/index.html', links: ['dsa/trees/persistent-segment-tree/index.html', 'dsa/trees/splay-tree/index.html'] }
            ]
          },
          {
            name: 'dsu-on-tree',
            label: 'DSU on Tree',
            children: [
              { title: 'Small to Large Merging', file: 'dsa/trees/dsu-on-tree/index.html', links: ['dsa/trees/euler-tour/index.html', 'dsa/trees/mos-on-trees/index.html'] }
            ]
          },
          {
            name: 'splay-tree',
            label: 'Splay Trees',
            children: [
              { title: 'Splay Trees', file: 'dsa/trees/splay-tree/index.html', links: ['dsa/trees/treap/index.html', 'dsa/trees/link-cut-tree/index.html'] }
            ]
          },
          {
            name: 'link-cut-tree',
            label: 'Link-Cut Trees',
            children: [
              { title: 'Link-Cut Trees', file: 'dsa/trees/link-cut-tree/index.html', links: ['dsa/trees/splay-tree/index.html', 'dsa/trees/virtual-tree/index.html'] }
            ]
          },
          {
            name: 'virtual-tree',
            label: 'Virtual Tree',
            children: [
              { title: 'Virtual Tree (Auxiliary Tree)', file: 'dsa/trees/virtual-tree/index.html', links: ['dsa/trees/lca/index.html', 'dsa/trees/link-cut-tree/index.html'] }
            ]
          },
          {
            name: 'mos-on-trees',
            label: "Mo's on Trees",
            children: [
              { title: "Mo's Algorithm on Trees", file: 'dsa/trees/mos-on-trees/index.html', links: ['dsa/trees/euler-tour/index.html', 'dsa/trees/dsu-on-tree/index.html'] }
            ]
          },
          {
            name: 'tree-hashing',
            label: 'Tree Hashing',
            children: [
              { title: 'Tree Hashing & Isomorphism', file: 'dsa/trees/tree-hashing/index.html', links: ['dsa/trees/lca/index.html'] }
            ]
          },
          {
            name: 'li-chao-tree',
            label: 'Li Chao Tree',
            children: [
              { title: 'Li Chao Tree', file: 'dsa/trees/li-chao-tree/index.html', links: ['dsa/trees/segment-tree/intro.html', 'dsa/trees/persistent-segment-tree/index.html'] }
            ]
          },
          {
            name: 'merge-sort-tree',
            label: 'Merge Sort Tree',
            children: [
              { title: 'Merge Sort Tree', file: 'dsa/trees/merge-sort-tree/index.html', links: ['dsa/trees/segment-tree/intro.html', 'dsa/trees/persistent-segment-tree/index.html'] }
            ]
          },
          {
            name: 'palindromic-tree',
            label: 'Palindromic Tree',
            children: [
              { title: 'Palindromic Tree (Eertree)', file: 'dsa/trees/palindromic-tree/index.html', links: ['dsa/trees/trie/index.html'] }
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
              { title: 'Cycle Detection in Graphs', file: 'dsa/graphs/cycle-detection/index.html' }
            ]
          },
          {
            name: 'topological-sort',
            label: 'Topological Sort',
            children: [
              { title: 'Topological Sort', file: 'dsa/graphs/topological-sort/index.html' }
            ]
          },
          {
            name: 'shortest-path',
            label: 'Shortest Path',
            children: [
              { title: 'BFS & 0-1 BFS Shortest Path', file: 'dsa/graphs/shortest-path/index.html' }
            ]
          },
          {
            name: 'dijkstra',
            label: 'Dijkstra',
            children: [
              { title: "Dijkstra's Algorithm", file: 'dsa/graphs/dijkstra/index.html' }
            ]
          },
          {
            name: 'bellman-ford',
            label: 'Bellman Ford',
            children: [
              { title: 'Bellman-Ford Algorithm', file: 'dsa/graphs/bellman-ford/index.html' }
            ]
          },
          {
            name: 'floyd-warshall',
            label: 'Floyd Warshall',
            children: [
              { title: 'Floyd-Warshall Algorithm', file: 'dsa/graphs/floyd-warshall/index.html' }
            ]
          },
          {
            name: 'disjoint-set-union',
            label: 'Disjoint Set Union',
            children: [
              { title: 'Disjoint Set Union', file: 'dsa/graphs/disjoint-set-union/index.html' }
            ]
          },
          {
            name: 'minimum-spanning-tree',
            label: 'Minimum Spanning Tree',
            children: [
              { title: 'Kruskal, Prim & Borůvka', file: 'dsa/graphs/minimum-spanning-tree/index.html' }
            ]
          },
          {
            name: 'bipartite',
            label: 'Bipartite',
            children: [
              { title: 'Bipartite Graphs & Matching', file: 'dsa/graphs/bipartite/index.html' }
            ]
          },
          {
            name: 'strongly-connected-components',
            label: 'Strongly Connected Components',
            children: [
              { title: "Kosaraju's Algorithm", file: 'dsa/graphs/strongly-connected-components/index.html' }
            ]
          },
          {
            name: 'tarjan-scc',
            label: "Tarjan's SCC",
            children: [
              { title: "Tarjan's SCC Algorithm", file: 'dsa/graphs/tarjan-scc/index.html' }
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
            name: 'block-cut-tree',
            label: 'Block-Cut Tree',
            children: [
              { title: 'Block-Cut Tree', file: 'dsa/graphs/block-cut-tree/index.html' }
            ]
          },
          {
            name: 'euler-path',
            label: 'Euler Path',
            children: [
              { title: 'Euler Path & Circuit', file: 'dsa/graphs/euler-path/index.html' }
            ]
          },
          {
            name: 'network-flow',
            label: 'Network Flow',
            children: [
              { title: 'Network Flow Algorithms', file: 'dsa/graphs/network-flow/index.html' }
            ]
          },
          {
            name: 'min-cost-flow',
            label: 'Min-Cost Flow',
            children: [
              { title: 'Min-Cost Maximum Flow', file: 'dsa/graphs/min-cost-flow/index.html' }
            ]
          },
          {
            name: 'graph-coloring',
            label: 'Graph Coloring',
            children: [
              { title: 'Graph Coloring', file: 'dsa/graphs/graph-coloring/index.html' }
            ]
          },
          {
            name: '2-sat',
            label: '2-SAT',
            children: [
              { title: '2-SAT', file: 'dsa/graphs/2-sat/index.html' }
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
    name: 'hld',
    label: 'High Level Design',
    children: [
      {
        name: 'foundations',
        label: 'Foundations',
        children: [
          { title: 'Introduction', file: 'hld/foundations/intro.html', links: ['hld/foundations/scaling.html'] },
          { title: 'Scaling', file: 'hld/foundations/scaling.html', links: ['hld/foundations/intro.html', 'hld/foundations/load-balancing.html'] },
          { title: 'Load Balancing', file: 'hld/foundations/load-balancing.html', links: ['hld/foundations/scaling.html', 'hld/foundations/caching.html'] },
          { title: 'Caching Strategies', file: 'hld/foundations/caching.html', links: ['hld/foundations/load-balancing.html', 'hld/foundations/databases.html'] },
          { title: 'SQL vs NoSQL', file: 'hld/foundations/databases.html', links: ['hld/foundations/caching.html', 'hld/foundations/cap-theorem.html'] },
          { title: 'CAP Theorem & PACELC', file: 'hld/foundations/cap-theorem.html', links: ['hld/foundations/databases.html', 'hld/foundations/acid-base.html'] },
          { title: 'ACID vs BASE', file: 'hld/foundations/acid-base.html', links: ['hld/foundations/cap-theorem.html', 'hld/foundations/consistent-hashing.html'] },
          { title: 'Consistent Hashing', file: 'hld/foundations/consistent-hashing.html', links: ['hld/foundations/acid-base.html', 'hld/foundations/cdn.html'] },
          { title: 'CDN & Edge Computing', file: 'hld/foundations/cdn.html', links: ['hld/foundations/consistent-hashing.html', 'hld/foundations/api-design.html'] },
          { title: 'API Design', file: 'hld/foundations/api-design.html', links: ['hld/foundations/cdn.html', 'hld/building-blocks/message-queues.html'] }
        ]
      },
      {
        name: 'building-blocks',
        label: 'Building Blocks',
        children: [
          { title: 'Message Queues', file: 'hld/building-blocks/message-queues.html', links: ['hld/foundations/api-design.html', 'hld/building-blocks/database-sharding.html'] },
          { title: 'Database Sharding', file: 'hld/building-blocks/database-sharding.html', links: ['hld/building-blocks/message-queues.html', 'hld/building-blocks/replication.html'] },
          { title: 'Replication', file: 'hld/building-blocks/replication.html', links: ['hld/building-blocks/database-sharding.html', 'hld/building-blocks/rate-limiting.html'] },
          { title: 'Rate Limiting', file: 'hld/building-blocks/rate-limiting.html', links: ['hld/building-blocks/replication.html', 'hld/building-blocks/service-discovery.html'] },
          { title: 'Service Discovery', file: 'hld/building-blocks/service-discovery.html', links: ['hld/building-blocks/rate-limiting.html', 'hld/building-blocks/proxies.html'] },
          { title: 'Proxies & API Gateway', file: 'hld/building-blocks/proxies.html', links: ['hld/building-blocks/service-discovery.html', 'hld/building-blocks/bloom-filters.html'] },
          { title: 'Bloom Filters', file: 'hld/building-blocks/bloom-filters.html', links: ['hld/building-blocks/proxies.html', 'hld/building-blocks/distributed-locking.html'] },
          { title: 'Distributed Locking', file: 'hld/building-blocks/distributed-locking.html', links: ['hld/building-blocks/bloom-filters.html', 'hld/building-blocks/heartbeat-health.html'] },
          { title: 'Heartbeat & Health', file: 'hld/building-blocks/heartbeat-health.html', links: ['hld/building-blocks/distributed-locking.html', 'hld/building-blocks/logging-monitoring.html'] },
          { title: 'Observability', file: 'hld/building-blocks/logging-monitoring.html', links: ['hld/building-blocks/heartbeat-health.html', 'hld/data-storage/sql-internals.html'] }
        ]
      },
      {
        name: 'data-storage',
        label: 'Data Storage',
        children: [
          { title: 'SQL Internals', file: 'hld/data-storage/sql-internals.html', links: ['hld/building-blocks/logging-monitoring.html', 'hld/data-storage/nosql-document.html'] },
          { title: 'Document Stores', file: 'hld/data-storage/nosql-document.html', links: ['hld/data-storage/sql-internals.html', 'hld/data-storage/nosql-keyvalue.html'] },
          { title: 'Key-Value Stores', file: 'hld/data-storage/nosql-keyvalue.html', links: ['hld/data-storage/nosql-document.html', 'hld/data-storage/nosql-column.html'] },
          { title: 'Column-Family Stores', file: 'hld/data-storage/nosql-column.html', links: ['hld/data-storage/nosql-keyvalue.html', 'hld/data-storage/nosql-graph.html'] },
          { title: 'Graph Databases', file: 'hld/data-storage/nosql-graph.html', links: ['hld/data-storage/nosql-column.html', 'hld/data-storage/time-series.html'] },
          { title: 'Time-Series Databases', file: 'hld/data-storage/time-series.html', links: ['hld/data-storage/nosql-graph.html', 'hld/data-storage/search-engines.html'] },
          { title: 'Search Engines', file: 'hld/data-storage/search-engines.html', links: ['hld/data-storage/time-series.html', 'hld/data-storage/object-storage.html'] },
          { title: 'Object Storage', file: 'hld/data-storage/object-storage.html', links: ['hld/data-storage/search-engines.html', 'hld/distributed-systems/consensus.html'] }
        ]
      },
      {
        name: 'distributed-systems',
        label: 'Distributed Systems',
        children: [
          { title: 'Consensus: Paxos & Raft', file: 'hld/distributed-systems/consensus.html', links: ['hld/data-storage/object-storage.html', 'hld/distributed-systems/vector-clocks.html'] },
          { title: 'Vector Clocks', file: 'hld/distributed-systems/vector-clocks.html', links: ['hld/distributed-systems/consensus.html', 'hld/distributed-systems/gossip-protocol.html'] },
          { title: 'Gossip Protocol', file: 'hld/distributed-systems/gossip-protocol.html', links: ['hld/distributed-systems/vector-clocks.html', 'hld/distributed-systems/two-phase-commit.html'] },
          { title: 'Two-Phase Commit', file: 'hld/distributed-systems/two-phase-commit.html', links: ['hld/distributed-systems/gossip-protocol.html', 'hld/distributed-systems/saga-pattern.html'] },
          { title: 'Saga Pattern', file: 'hld/distributed-systems/saga-pattern.html', links: ['hld/distributed-systems/two-phase-commit.html', 'hld/distributed-systems/circuit-breaker.html'] },
          { title: 'Circuit Breaker', file: 'hld/distributed-systems/circuit-breaker.html', links: ['hld/distributed-systems/saga-pattern.html', 'hld/distributed-systems/leader-election.html'] },
          { title: 'Leader Election', file: 'hld/distributed-systems/leader-election.html', links: ['hld/distributed-systems/circuit-breaker.html', 'hld/distributed-systems/idempotency.html'] },
          { title: 'Idempotency', file: 'hld/distributed-systems/idempotency.html', links: ['hld/distributed-systems/leader-election.html', 'hld/architecture-patterns/microservices.html'] }
        ]
      },
      {
        name: 'architecture-patterns',
        label: 'Architecture Patterns',
        children: [
          { title: 'Microservices', file: 'hld/architecture-patterns/microservices.html', links: ['hld/distributed-systems/idempotency.html', 'hld/architecture-patterns/event-driven.html'] },
          { title: 'Event-Driven', file: 'hld/architecture-patterns/event-driven.html', links: ['hld/architecture-patterns/microservices.html', 'hld/architecture-patterns/cqrs-event-sourcing.html'] },
          { title: 'CQRS & Event Sourcing', file: 'hld/architecture-patterns/cqrs-event-sourcing.html', links: ['hld/architecture-patterns/event-driven.html', 'hld/architecture-patterns/ddd.html'] },
          { title: 'Domain-Driven Design', file: 'hld/architecture-patterns/ddd.html', links: ['hld/architecture-patterns/cqrs-event-sourcing.html', 'hld/architecture-patterns/serverless.html'] },
          { title: 'Serverless', file: 'hld/architecture-patterns/serverless.html', links: ['hld/architecture-patterns/ddd.html', 'hld/architecture-patterns/data-pipelines.html'] },
          { title: 'Data Pipelines', file: 'hld/architecture-patterns/data-pipelines.html', links: ['hld/architecture-patterns/serverless.html', 'hld/real-world/url-shortener.html'] }
        ]
      },
      {
        name: 'real-world',
        label: 'Real-World Designs',
        children: [
          { title: 'URL Shortener', file: 'hld/real-world/url-shortener.html', links: ['hld/architecture-patterns/data-pipelines.html', 'hld/real-world/pastebin.html'] },
          { title: 'Pastebin', file: 'hld/real-world/pastebin.html', links: ['hld/real-world/url-shortener.html', 'hld/real-world/rate-limiter.html'] },
          { title: 'Rate Limiter', file: 'hld/real-world/rate-limiter.html', links: ['hld/real-world/pastebin.html', 'hld/real-world/key-value-store.html'] },
          { title: 'Key-Value Store', file: 'hld/real-world/key-value-store.html', links: ['hld/real-world/rate-limiter.html', 'hld/real-world/unique-id-generator.html'] },
          { title: 'Unique ID Generator', file: 'hld/real-world/unique-id-generator.html', links: ['hld/real-world/key-value-store.html', 'hld/real-world/notification-system.html'] },
          { title: 'Notification System', file: 'hld/real-world/notification-system.html', links: ['hld/real-world/unique-id-generator.html', 'hld/real-world/chat-system.html'] },
          { title: 'Chat System', file: 'hld/real-world/chat-system.html', links: ['hld/real-world/notification-system.html', 'hld/real-world/search-autocomplete.html'] },
          { title: 'Search Autocomplete', file: 'hld/real-world/search-autocomplete.html', links: ['hld/real-world/chat-system.html', 'hld/real-world/youtube.html'] },
          { title: 'YouTube', file: 'hld/real-world/youtube.html', links: ['hld/real-world/search-autocomplete.html', 'hld/real-world/google-drive.html'] },
          { title: 'Google Drive', file: 'hld/real-world/google-drive.html', links: ['hld/real-world/youtube.html', 'hld/real-world/news-feed.html'] },
          { title: 'News Feed', file: 'hld/real-world/news-feed.html', links: ['hld/real-world/google-drive.html', 'hld/real-world/proximity-service.html'] },
          { title: 'Proximity Service', file: 'hld/real-world/proximity-service.html', links: ['hld/real-world/news-feed.html', 'hld/real-world/nearby-friends.html'] },
          { title: 'Nearby Friends', file: 'hld/real-world/nearby-friends.html', links: ['hld/real-world/proximity-service.html', 'hld/real-world/google-maps.html'] },
          { title: 'Google Maps', file: 'hld/real-world/google-maps.html', links: ['hld/real-world/nearby-friends.html', 'hld/real-world/uber.html'] },
          { title: 'Uber', file: 'hld/real-world/uber.html', links: ['hld/real-world/google-maps.html', 'hld/real-world/twitter.html'] },
          { title: 'Twitter', file: 'hld/real-world/twitter.html', links: ['hld/real-world/uber.html', 'hld/real-world/ticketmaster.html'] },
          { title: 'Ticketmaster', file: 'hld/real-world/ticketmaster.html', links: ['hld/real-world/twitter.html', 'hld/real-world/stock-exchange.html'] },
          { title: 'Stock Exchange', file: 'hld/real-world/stock-exchange.html', links: ['hld/real-world/ticketmaster.html', 'hld/real-world/web-crawler.html'] },
          { title: 'Web Crawler', file: 'hld/real-world/web-crawler.html', links: ['hld/real-world/stock-exchange.html', 'hld/real-world/payment-system.html'] },
          { title: 'Payment System', file: 'hld/real-world/payment-system.html', links: ['hld/real-world/web-crawler.html', 'hld/real-world/hotel-reservation.html'] },
          { title: 'Hotel Reservation', file: 'hld/real-world/hotel-reservation.html', links: ['hld/real-world/payment-system.html', 'hld/real-world/email-system.html'] },
          { title: 'Email System', file: 'hld/real-world/email-system.html', links: ['hld/real-world/hotel-reservation.html', 'hld/real-world/ad-click-aggregator.html'] },
          { title: 'Ad Click Aggregator', file: 'hld/real-world/ad-click-aggregator.html', links: ['hld/real-world/email-system.html', 'hld/case-studies/netflix-architecture.html'] }
        ]
      },
      {
        name: 'case-studies',
        label: 'Case Studies',
        children: [
          { title: 'Netflix Architecture', file: 'hld/case-studies/netflix-architecture.html', links: ['hld/real-world/ad-click-aggregator.html', 'hld/case-studies/uber-engineering.html'] },
          { title: 'Uber Engineering', file: 'hld/case-studies/uber-engineering.html', links: ['hld/case-studies/netflix-architecture.html', 'hld/case-studies/discord-infrastructure.html'] },
          { title: 'Discord at Scale', file: 'hld/case-studies/discord-infrastructure.html', links: ['hld/case-studies/uber-engineering.html', 'hld/case-studies/slack-architecture.html'] },
          { title: 'Slack Architecture', file: 'hld/case-studies/slack-architecture.html', links: ['hld/case-studies/discord-infrastructure.html', 'hld/case-studies/interview-framework.html'] },
          { title: 'Interview Framework', file: 'hld/case-studies/interview-framework.html', links: ['hld/case-studies/slack-architecture.html'] }
        ]
      }
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
                  { title: 'Overview', file: 'ml/transformers/from-scratch/cpp/index.html' },
                  {
                    name: 'basic-blocks',
                    label: 'Basic Blocks',
                    children: [
                      { title: 'Single Attention Head', file: 'ml/transformers/from-scratch/cpp/basic-blocks/single-attention-head.html' },
                      { title: 'Multi-Head Attention', file: 'ml/transformers/from-scratch/cpp/basic-blocks/multi-head-attention.html' },
                      { title: 'Feed-Forward Network', file: 'ml/transformers/from-scratch/cpp/basic-blocks/feed-forward.html' },
                      { title: 'Transformer Block', file: 'ml/transformers/from-scratch/cpp/basic-blocks/transformer-block.html' }
                    ]
                  }
                ]
              },
              {
                name: 'libtorch',
                label: 'LibTorch Deep Dives',
                children: [
                  { title: 'register_module', file: 'ml/transformers/from-scratch/libtorch/register-module.html' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'mlops',
    label: 'MLOps',
    children: [
      {
        name: 'foundations',
        label: 'Foundations',
        children: [
          { title: 'Build vs Buy: When to Use Managed ML Services', file: 'mlops/foundations/build-vs-buy.html', links: ['mlops/foundations/cost-of-ml.html'] },
          { title: 'The Cost of ML Systems: FinOps for ML', file: 'mlops/foundations/cost-of-ml.html', links: ['mlops/foundations/build-vs-buy.html', 'mlops/foundations/maturity-model.html'] },
          { title: 'MLOps Maturity Model: Levels 0–4', file: 'mlops/foundations/maturity-model.html', links: ['mlops/foundations/cost-of-ml.html', 'mlops/foundations/ml-design-docs.html'] },
          { title: 'Writing ML Design Documents', file: 'mlops/foundations/ml-design-docs.html', links: ['mlops/foundations/maturity-model.html', 'mlops/foundations/ml-lifecycle.html'] },
          { title: 'The ML Lifecycle: From Data to Deployment', file: 'mlops/foundations/ml-lifecycle.html', links: ['mlops/foundations/ml-design-docs.html', 'mlops/foundations/ml-project-structure.html'] },
          { title: 'Structuring ML Projects: Mono-repo Patterns', file: 'mlops/foundations/ml-project-structure.html', links: ['mlops/foundations/ml-lifecycle.html', 'mlops/foundations/mlops-landscape.html'] },
          { title: 'The MLOps Tool Landscape: 2024–2026', file: 'mlops/foundations/mlops-landscape.html', links: ['mlops/foundations/ml-project-structure.html', 'mlops/foundations/mlops-vs-devops.html'] },
          { title: 'MLOps vs DevOps vs DataOps vs AIOps', file: 'mlops/foundations/mlops-vs-devops.html', links: ['mlops/foundations/mlops-landscape.html', 'mlops/foundations/reproducibility.html'] },
          { title: 'Reproducibility in ML', file: 'mlops/foundations/reproducibility.html', links: ['mlops/foundations/mlops-vs-devops.html', 'mlops/foundations/team-structures.html'] },
          { title: 'ML Team Structures', file: 'mlops/foundations/team-structures.html', links: ['mlops/foundations/reproducibility.html', 'mlops/foundations/technical-debt.html'] },
          { title: 'Hidden Technical Debt in ML Systems', file: 'mlops/foundations/technical-debt.html', links: ['mlops/foundations/team-structures.html', 'mlops/foundations/what-is-mlops.html'] },
          { title: 'What is MLOps? From DevOps to MLOps', file: 'mlops/foundations/what-is-mlops.html', links: ['mlops/foundations/technical-debt.html'] }
        ]
      },
      {
        name: 'data-engineering',
        label: 'Data Engineering',
        children: [
          { title: 'Active Learning: Smart Labeling', file: 'mlops/data-engineering/active-learning.html', links: ['mlops/data-engineering/airflow-vs-prefect-vs-dagster.html'] },
          { title: 'Airflow vs Prefect vs Dagster', file: 'mlops/data-engineering/airflow-vs-prefect-vs-dagster.html', links: ['mlops/data-engineering/active-learning.html', 'mlops/data-engineering/batch-vs-streaming.html'] },
          { title: 'Batch vs Streaming Data for ML', file: 'mlops/data-engineering/batch-vs-streaming.html', links: ['mlops/data-engineering/airflow-vs-prefect-vs-dagster.html', 'mlops/data-engineering/dagster.html'] },
          { title: 'Dagster: Software-Defined Data Assets', file: 'mlops/data-engineering/dagster.html', links: ['mlops/data-engineering/batch-vs-streaming.html', 'mlops/data-engineering/data-augmentation.html'] },
          { title: 'Data Augmentation Pipelines', file: 'mlops/data-engineering/data-augmentation.html', links: ['mlops/data-engineering/dagster.html', 'mlops/data-engineering/data-bias.html'] },
          { title: 'Detecting and Mitigating Data Bias', file: 'mlops/data-engineering/data-bias.html', links: ['mlops/data-engineering/data-augmentation.html', 'mlops/data-engineering/data-catalogs.html'] },
          { title: 'Data Catalogs and Discovery', file: 'mlops/data-engineering/data-catalogs.html', links: ['mlops/data-engineering/data-bias.html', 'mlops/data-engineering/data-collection.html'] },
          { title: 'Data Collection Patterns for ML at Scale', file: 'mlops/data-engineering/data-collection.html', links: ['mlops/data-engineering/data-catalogs.html', 'mlops/data-engineering/data-labeling.html'] },
          { title: 'Data Labeling: Tools, Strategies, Quality Control', file: 'mlops/data-engineering/data-labeling.html', links: ['mlops/data-engineering/data-collection.html', 'mlops/data-engineering/data-lineage.html'] },
          { title: 'Data Lineage: Source to Model', file: 'mlops/data-engineering/data-lineage.html', links: ['mlops/data-engineering/data-labeling.html', 'mlops/data-engineering/data-pipelines-airflow.html'] },
          { title: 'ML Data Pipelines with Apache Airflow', file: 'mlops/data-engineering/data-pipelines-airflow.html', links: ['mlops/data-engineering/data-lineage.html', 'mlops/data-engineering/data-quality.html'] },
          { title: 'Data Quality Metrics and Monitoring', file: 'mlops/data-engineering/data-quality.html', links: ['mlops/data-engineering/data-pipelines-airflow.html', 'mlops/data-engineering/data-sampling.html'] },
          { title: 'Sampling Strategies for Training Data', file: 'mlops/data-engineering/data-sampling.html', links: ['mlops/data-engineering/data-quality.html', 'mlops/data-engineering/data-validation.html'] },
          { title: 'Data Validation with Great Expectations', file: 'mlops/data-engineering/data-validation.html', links: ['mlops/data-engineering/data-sampling.html', 'mlops/data-engineering/data-versioning.html'] },
          { title: 'Data Versioning with DVC', file: 'mlops/data-engineering/data-versioning.html', links: ['mlops/data-engineering/data-validation.html', 'mlops/data-engineering/dbt-for-ml.html'] },
          { title: 'dbt for ML Feature Transforms', file: 'mlops/data-engineering/dbt-for-ml.html', links: ['mlops/data-engineering/data-versioning.html', 'mlops/data-engineering/etl-vs-elt.html'] },
          { title: 'ETL vs ELT for ML Workloads', file: 'mlops/data-engineering/etl-vs-elt.html', links: ['mlops/data-engineering/dbt-for-ml.html', 'mlops/data-engineering/kafka-for-ml.html'] },
          { title: 'Apache Kafka for Real-Time ML', file: 'mlops/data-engineering/kafka-for-ml.html', links: ['mlops/data-engineering/etl-vs-elt.html', 'mlops/data-engineering/lakefs.html'] },
          { title: 'LakeFS: Git-like Branching for Data Lakes', file: 'mlops/data-engineering/lakefs.html', links: ['mlops/data-engineering/kafka-for-ml.html', 'mlops/data-engineering/prefect.html'] },
          { title: 'Prefect: Modern Pipeline Orchestration', file: 'mlops/data-engineering/prefect.html', links: ['mlops/data-engineering/lakefs.html', 'mlops/data-engineering/schema-evolution.html'] },
          { title: 'Schema Evolution: Managing Data Contracts', file: 'mlops/data-engineering/schema-evolution.html', links: ['mlops/data-engineering/prefect.html', 'mlops/data-engineering/spark-for-ml.html'] },
          { title: 'Apache Spark for Large-Scale Processing', file: 'mlops/data-engineering/spark-for-ml.html', links: ['mlops/data-engineering/schema-evolution.html', 'mlops/data-engineering/synthetic-data.html'] },
          { title: 'Synthetic Data Generation for ML', file: 'mlops/data-engineering/synthetic-data.html', links: ['mlops/data-engineering/spark-for-ml.html', 'mlops/data-engineering/tfdv.html'] },
          { title: 'TensorFlow Data Validation', file: 'mlops/data-engineering/tfdv.html', links: ['mlops/data-engineering/synthetic-data.html', 'mlops/data-engineering/weak-supervision.html'] },
          { title: 'Weak Supervision &amp; Programmatic Labeling (Snorkel)', file: 'mlops/data-engineering/weak-supervision.html', links: ['mlops/data-engineering/tfdv.html'] }
        ]
      },
      {
        name: 'feature-stores',
        label: 'Feature Stores',
        children: [
          { title: 'Embedding Features: Storing and Serving Vectors', file: 'mlops/feature-stores/embedding-features.html', links: ['mlops/feature-stores/entity-resolution.html'] },
          { title: 'Entity Resolution for Feature Stores', file: 'mlops/feature-stores/entity-resolution.html', links: ['mlops/feature-stores/embedding-features.html', 'mlops/feature-stores/feast.html'] },
          { title: 'Feast: Open Source Feature Store', file: 'mlops/feature-stores/feast.html', links: ['mlops/feature-stores/entity-resolution.html', 'mlops/feature-stores/feature-backfill.html'] },
          { title: 'Feature Backfilling', file: 'mlops/feature-stores/feature-backfill.html', links: ['mlops/feature-stores/feast.html', 'mlops/feature-stores/feature-discovery.html'] },
          { title: 'Feature Discovery and Reuse', file: 'mlops/feature-stores/feature-discovery.html', links: ['mlops/feature-stores/feature-backfill.html', 'mlops/feature-stores/feature-engineering-fundamentals.html'] },
          { title: 'Feature Engineering Fundamentals', file: 'mlops/feature-stores/feature-engineering-fundamentals.html', links: ['mlops/feature-stores/feature-discovery.html', 'mlops/feature-stores/feature-freshness.html'] },
          { title: 'Feature Freshness: How Stale Is Too Stale?', file: 'mlops/feature-stores/feature-freshness.html', links: ['mlops/feature-stores/feature-engineering-fundamentals.html', 'mlops/feature-stores/feature-monitoring.html'] },
          { title: 'Feature Monitoring: Drift, Distribution, Staleness', file: 'mlops/feature-stores/feature-monitoring.html', links: ['mlops/feature-stores/feature-freshness.html', 'mlops/feature-stores/feature-pipelines.html'] },
          { title: 'Feature Pipelines: Batch + Streaming', file: 'mlops/feature-stores/feature-pipelines.html', links: ['mlops/feature-stores/feature-monitoring.html', 'mlops/feature-stores/feature-schemas.html'] },
          { title: 'Feature Schemas, Types, and Validation', file: 'mlops/feature-stores/feature-schemas.html', links: ['mlops/feature-stores/feature-pipelines.html', 'mlops/feature-stores/feature-store-architecture.html'] },
          { title: 'Feature Store Architecture', file: 'mlops/feature-stores/feature-store-architecture.html', links: ['mlops/feature-stores/feature-schemas.html', 'mlops/feature-stores/feature-store-at-scale.html'] },
          { title: 'Feature Stores at Scale: Uber, Netflix, Airbnb', file: 'mlops/feature-stores/feature-store-at-scale.html', links: ['mlops/feature-stores/feature-store-architecture.html', 'mlops/feature-stores/feature-transforms.html'] },
          { title: 'Feature Transforms: Raw → Production-Ready', file: 'mlops/feature-stores/feature-transforms.html', links: ['mlops/feature-stores/feature-store-at-scale.html', 'mlops/feature-stores/online-vs-offline.html'] },
          { title: 'Online vs Offline Feature Serving', file: 'mlops/feature-stores/online-vs-offline.html', links: ['mlops/feature-stores/feature-transforms.html', 'mlops/feature-stores/point-in-time.html'] },
          { title: 'Point-in-Time Correctness', file: 'mlops/feature-stores/point-in-time.html', links: ['mlops/feature-stores/online-vs-offline.html', 'mlops/feature-stores/real-time-features.html'] },
          { title: 'Real-Time Feature Computation', file: 'mlops/feature-stores/real-time-features.html', links: ['mlops/feature-stores/point-in-time.html', 'mlops/feature-stores/tecton.html'] },
          { title: 'Tecton: Enterprise Feature Platform', file: 'mlops/feature-stores/tecton.html', links: ['mlops/feature-stores/real-time-features.html', 'mlops/feature-stores/what-is-feature-store.html'] },
          { title: 'What is a Feature Store?', file: 'mlops/feature-stores/what-is-feature-store.html', links: ['mlops/feature-stores/tecton.html'] }
        ]
      },
      {
        name: 'experiment-tracking',
        label: 'Experiment Tracking',
        children: [
          { title: 'AutoML: Automated ML Pipelines', file: 'mlops/experiment-tracking/automl-overview.html', links: ['mlops/experiment-tracking/collaboration-patterns.html'] },
          { title: 'Collaboration Patterns for ML Experiments', file: 'mlops/experiment-tracking/collaboration-patterns.html', links: ['mlops/experiment-tracking/automl-overview.html', 'mlops/experiment-tracking/experiment-analysis.html'] },
          { title: 'Experiment Analysis: Statistical Significance', file: 'mlops/experiment-tracking/experiment-analysis.html', links: ['mlops/experiment-tracking/collaboration-patterns.html', 'mlops/experiment-tracking/experiment-versioning.html'] },
          { title: 'Experiment Versioning: Code + Data + Config', file: 'mlops/experiment-tracking/experiment-versioning.html', links: ['mlops/experiment-tracking/experiment-analysis.html', 'mlops/experiment-tracking/hyperparameter-tuning.html'] },
          { title: 'Hyperparameter Tuning: Grid, Random, Bayesian', file: 'mlops/experiment-tracking/hyperparameter-tuning.html', links: ['mlops/experiment-tracking/experiment-versioning.html', 'mlops/experiment-tracking/mlflow-projects.html'] },
          { title: 'MLflow Projects: Reproducible ML Runs', file: 'mlops/experiment-tracking/mlflow-projects.html', links: ['mlops/experiment-tracking/hyperparameter-tuning.html', 'mlops/experiment-tracking/mlflow-tracking.html'] },
          { title: 'MLflow Tracking: Experiments, Metrics, Artifacts', file: 'mlops/experiment-tracking/mlflow-tracking.html', links: ['mlops/experiment-tracking/mlflow-projects.html', 'mlops/experiment-tracking/mlflow-vs-wandb-vs-neptune.html'] },
          { title: 'MLflow vs W&amp;B vs Neptune', file: 'mlops/experiment-tracking/mlflow-vs-wandb-vs-neptune.html', links: ['mlops/experiment-tracking/mlflow-tracking.html', 'mlops/experiment-tracking/multi-objective-optimization.html'] },
          { title: 'Multi-Objective Optimization in HPO', file: 'mlops/experiment-tracking/multi-objective-optimization.html', links: ['mlops/experiment-tracking/mlflow-vs-wandb-vs-neptune.html', 'mlops/experiment-tracking/neptune.html'] },
          { title: 'Neptune.ai: Metadata Store for ML', file: 'mlops/experiment-tracking/neptune.html', links: ['mlops/experiment-tracking/multi-objective-optimization.html', 'mlops/experiment-tracking/neural-architecture-search.html'] },
          { title: 'Neural Architecture Search for Ops', file: 'mlops/experiment-tracking/neural-architecture-search.html', links: ['mlops/experiment-tracking/neptune.html', 'mlops/experiment-tracking/optuna.html'] },
          { title: 'Optuna: Advanced HPO', file: 'mlops/experiment-tracking/optuna.html', links: ['mlops/experiment-tracking/neural-architecture-search.html', 'mlops/experiment-tracking/ray-tune.html'] },
          { title: 'Ray Tune: Distributed HPO', file: 'mlops/experiment-tracking/ray-tune.html', links: ['mlops/experiment-tracking/optuna.html', 'mlops/experiment-tracking/wandb.html'] },
          { title: 'Weights &amp; Biases: Collaborative Tracking', file: 'mlops/experiment-tracking/wandb.html', links: ['mlops/experiment-tracking/ray-tune.html', 'mlops/experiment-tracking/why-experiment-tracking.html'] },
          { title: 'Why Experiment Tracking Matters', file: 'mlops/experiment-tracking/why-experiment-tracking.html', links: ['mlops/experiment-tracking/wandb.html'] }
        ]
      },
      {
        name: 'training-infra',
        label: 'Training Infrastructure',
        children: [
          { title: 'Checkpointing: Frequency, Async, Elastic', file: 'mlops/training-infra/checkpointing.html', links: ['mlops/training-infra/data-parallelism.html'] },
          { title: 'Data Parallelism: Scaling Across GPUs', file: 'mlops/training-infra/data-parallelism.html', links: ['mlops/training-infra/checkpointing.html', 'mlops/training-infra/deepspeed-vs-fsdp.html'] },
          { title: 'DeepSpeed vs FSDP', file: 'mlops/training-infra/deepspeed-vs-fsdp.html', links: ['mlops/training-infra/data-parallelism.html', 'mlops/training-infra/deepspeed.html'] },
          { title: 'DeepSpeed: ZeRO Stages 1–3', file: 'mlops/training-infra/deepspeed.html', links: ['mlops/training-infra/deepspeed-vs-fsdp.html', 'mlops/training-infra/distributed-training-comms.html'] },
          { title: 'Communication: AllReduce, AllGather, Ring', file: 'mlops/training-infra/distributed-training-comms.html', links: ['mlops/training-infra/deepspeed.html', 'mlops/training-infra/fsdp.html'] },
          { title: 'PyTorch FSDP: Fully Sharded Data Parallel', file: 'mlops/training-infra/fsdp.html', links: ['mlops/training-infra/distributed-training-comms.html', 'mlops/training-infra/gpu-fundamentals.html'] },
          { title: 'GPU Fundamentals for ML Engineers', file: 'mlops/training-infra/gpu-fundamentals.html', links: ['mlops/training-infra/fsdp.html', 'mlops/training-infra/gpu-memory.html'] },
          { title: 'GPU Memory Management: OOM Debugging', file: 'mlops/training-infra/gpu-memory.html', links: ['mlops/training-infra/gpu-fundamentals.html', 'mlops/training-infra/gradient-accumulation.html'] },
          { title: 'Gradient Accumulation: Virtual Batch Sizes', file: 'mlops/training-infra/gradient-accumulation.html', links: ['mlops/training-infra/gpu-memory.html', 'mlops/training-infra/gradient-checkpointing.html'] },
          { title: 'Gradient Checkpointing: Compute vs Memory', file: 'mlops/training-infra/gradient-checkpointing.html', links: ['mlops/training-infra/gradient-accumulation.html', 'mlops/training-infra/mixed-precision.html'] },
          { title: 'Mixed Precision: FP16, BF16, FP8', file: 'mlops/training-infra/mixed-precision.html', links: ['mlops/training-infra/gradient-checkpointing.html', 'mlops/training-infra/model-parallelism.html'] },
          { title: 'Model Parallelism: Tensor and Pipeline', file: 'mlops/training-infra/model-parallelism.html', links: ['mlops/training-infra/mixed-precision.html', 'mlops/training-infra/multi-gpu-training.html'] },
          { title: 'Multi-GPU: DataParallel vs DDP', file: 'mlops/training-infra/multi-gpu-training.html', links: ['mlops/training-infra/model-parallelism.html', 'mlops/training-infra/nccl.html'] },
          { title: 'NCCL: NVIDIA Collective Communications', file: 'mlops/training-infra/nccl.html', links: ['mlops/training-infra/multi-gpu-training.html', 'mlops/training-infra/pipeline-parallelism.html'] },
          { title: 'Pipeline Parallelism: GPipe and PipeDream', file: 'mlops/training-infra/pipeline-parallelism.html', links: ['mlops/training-infra/nccl.html', 'mlops/training-infra/resource-scheduling.html'] },
          { title: 'Resource Scheduling: Slurm, K8s, Custom', file: 'mlops/training-infra/resource-scheduling.html', links: ['mlops/training-infra/pipeline-parallelism.html', 'mlops/training-infra/scaling-laws.html'] },
          { title: 'Scaling Laws: Chinchilla, Kaplan', file: 'mlops/training-infra/scaling-laws.html', links: ['mlops/training-infra/resource-scheduling.html', 'mlops/training-infra/spot-instances.html'] },
          { title: 'Training on Spot Instances: Fault Tolerance', file: 'mlops/training-infra/spot-instances.html', links: ['mlops/training-infra/scaling-laws.html', 'mlops/training-infra/tpu-training.html'] },
          { title: 'TPU Training: Differences from GPU', file: 'mlops/training-infra/tpu-training.html', links: ['mlops/training-infra/spot-instances.html', 'mlops/training-infra/training-debugging.html'] },
          { title: 'Debugging Training: NaN, Divergence', file: 'mlops/training-infra/training-debugging.html', links: ['mlops/training-infra/tpu-training.html', 'mlops/training-infra/training-monitoring.html'] },
          { title: 'Training Monitoring: Loss, GPU Utilization', file: 'mlops/training-infra/training-monitoring.html', links: ['mlops/training-infra/training-debugging.html', 'mlops/training-infra/training-pipelines.html'] },
          { title: 'Designing Model Training Pipelines', file: 'mlops/training-infra/training-pipelines.html', links: ['mlops/training-infra/training-monitoring.html'] }
        ]
      },
      {
        name: 'model-registry',
        label: 'Model Registry',
        children: [
          { title: 'Artifact Management: S3, GCS, Model Stores', file: 'mlops/model-registry/artifact-management.html', links: ['mlops/model-registry/container-packaging.html'] },
          { title: 'Containerizing ML Models: Docker', file: 'mlops/model-registry/container-packaging.html', links: ['mlops/model-registry/artifact-management.html', 'mlops/model-registry/mlflow-registry.html'] },
          { title: 'MLflow Model Registry', file: 'mlops/model-registry/mlflow-registry.html', links: ['mlops/model-registry/container-packaging.html', 'mlops/model-registry/model-cards.html'] },
          { title: 'Model Cards: Documentation for Responsible ML', file: 'mlops/model-registry/model-cards.html', links: ['mlops/model-registry/mlflow-registry.html', 'mlops/model-registry/model-lineage.html'] },
          { title: 'Model Lineage: Data → Code → Model → Deployment', file: 'mlops/model-registry/model-lineage.html', links: ['mlops/model-registry/model-cards.html', 'mlops/model-registry/model-metadata.html'] },
          { title: 'Model Metadata: What to Track', file: 'mlops/model-registry/model-metadata.html', links: ['mlops/model-registry/model-lineage.html', 'mlops/model-registry/model-signing.html'] },
          { title: 'Model Signing and Integrity', file: 'mlops/model-registry/model-signing.html', links: ['mlops/model-registry/model-metadata.html', 'mlops/model-registry/model-versioning.html'] },
          { title: 'Model Versioning Strategies', file: 'mlops/model-registry/model-versioning.html', links: ['mlops/model-registry/model-signing.html', 'mlops/model-registry/onnx-deep-dive.html'] },
          { title: 'ONNX: The Universal Model Format', file: 'mlops/model-registry/onnx-deep-dive.html', links: ['mlops/model-registry/model-versioning.html', 'mlops/model-registry/registry-at-scale.html'] },
          { title: 'Running a Model Registry at Scale', file: 'mlops/model-registry/registry-at-scale.html', links: ['mlops/model-registry/onnx-deep-dive.html', 'mlops/model-registry/serialization-formats.html'] },
          { title: 'Model Serialization: pickle, ONNX, TorchScript, SavedModel', file: 'mlops/model-registry/serialization-formats.html', links: ['mlops/model-registry/registry-at-scale.html', 'mlops/model-registry/torchscript.html'] },
          { title: 'TorchScript and torch.compile', file: 'mlops/model-registry/torchscript.html', links: ['mlops/model-registry/serialization-formats.html'] }
        ]
      },
      {
        name: 'ci-cd',
        label: 'CI/CD for ML',
        children: [
          { title: 'CI/CD for ML: Beyond Software Pipelines', file: 'mlops/ci-cd/cicd-for-ml.html', links: ['mlops/ci-cd/continuous-evaluation.html'] },
          { title: 'Continuous Evaluation: Production Quality', file: 'mlops/ci-cd/continuous-evaluation.html', links: ['mlops/ci-cd/cicd-for-ml.html', 'mlops/ci-cd/continuous-training.html'] },
          { title: 'Continuous Training: Automated Retraining', file: 'mlops/ci-cd/continuous-training.html', links: ['mlops/ci-cd/continuous-evaluation.html', 'mlops/ci-cd/data-tests.html'] },
          { title: 'Data Tests: Validating Training and Serving Data', file: 'mlops/ci-cd/data-tests.html', links: ['mlops/ci-cd/continuous-training.html', 'mlops/ci-cd/feature-flags-ml.html'] },
          { title: 'Feature Flags for ML: Gradual Rollouts', file: 'mlops/ci-cd/feature-flags-ml.html', links: ['mlops/ci-cd/data-tests.html', 'mlops/ci-cd/github-actions-ml.html'] },
          { title: 'GitHub Actions for ML: CI/CD Workflows', file: 'mlops/ci-cd/github-actions-ml.html', links: ['mlops/ci-cd/feature-flags-ml.html', 'mlops/ci-cd/gitops-for-ml.html'] },
          { title: 'GitOps for ML: IaC for ML Pipelines', file: 'mlops/ci-cd/gitops-for-ml.html', links: ['mlops/ci-cd/github-actions-ml.html', 'mlops/ci-cd/infrastructure-tests.html'] },
          { title: 'Infrastructure Tests for ML Pipelines', file: 'mlops/ci-cd/infrastructure-tests.html', links: ['mlops/ci-cd/gitops-for-ml.html', 'mlops/ci-cd/kubeflow-vs-vertex-vs-sagemaker.html'] },
          { title: 'Kubeflow vs Vertex AI vs SageMaker', file: 'mlops/ci-cd/kubeflow-vs-vertex-vs-sagemaker.html', links: ['mlops/ci-cd/infrastructure-tests.html', 'mlops/ci-cd/ml-pipeline-patterns.html'] },
          { title: 'ML Pipeline Design Patterns', file: 'mlops/ci-cd/ml-pipeline-patterns.html', links: ['mlops/ci-cd/kubeflow-vs-vertex-vs-sagemaker.html', 'mlops/ci-cd/ml-pipeline-testing.html'] },
          { title: 'Testing ML Pipelines: Mocking, Fixtures, Contracts', file: 'mlops/ci-cd/ml-pipeline-testing.html', links: ['mlops/ci-cd/ml-pipeline-patterns.html', 'mlops/ci-cd/ml-pipelines-kubeflow.html'] },
          { title: 'Kubeflow Pipelines: End-to-End Workflows', file: 'mlops/ci-cd/ml-pipelines-kubeflow.html', links: ['mlops/ci-cd/ml-pipeline-testing.html', 'mlops/ci-cd/model-tests.html'] },
          { title: 'Model Tests: Performance, Behavioral, Invariance', file: 'mlops/ci-cd/model-tests.html', links: ['mlops/ci-cd/ml-pipelines-kubeflow.html', 'mlops/ci-cd/rollback-strategies.html'] },
          { title: 'Rollback Strategies for ML Models', file: 'mlops/ci-cd/rollback-strategies.html', links: ['mlops/ci-cd/model-tests.html', 'mlops/ci-cd/sagemaker-pipelines.html'] },
          { title: 'SageMaker Pipelines: AWS ML Workflows', file: 'mlops/ci-cd/sagemaker-pipelines.html', links: ['mlops/ci-cd/rollback-strategies.html', 'mlops/ci-cd/testing-ml-systems.html'] },
          { title: 'Testing ML Systems: Unit, Integration, System', file: 'mlops/ci-cd/testing-ml-systems.html', links: ['mlops/ci-cd/sagemaker-pipelines.html', 'mlops/ci-cd/trigger-patterns.html'] },
          { title: 'Training Triggers: Schedule, Data, Performance', file: 'mlops/ci-cd/trigger-patterns.html', links: ['mlops/ci-cd/testing-ml-systems.html', 'mlops/ci-cd/vertex-ai-pipelines.html'] },
          { title: 'Vertex AI Pipelines: GCP ML Pipelines', file: 'mlops/ci-cd/vertex-ai-pipelines.html', links: ['mlops/ci-cd/trigger-patterns.html'] }
        ]
      },
      {
        name: 'model-serving',
        label: 'Model Serving',
        children: [
          { title: 'A/B Testing ML Models', file: 'mlops/model-serving/ab-testing-models.html', links: ['mlops/model-serving/api-design-ml.html'] },
          { title: 'API Design for ML: REST, gRPC, GraphQL', file: 'mlops/model-serving/api-design-ml.html', links: ['mlops/model-serving/ab-testing-models.html', 'mlops/model-serving/autoscaling-ml.html'] },
          { title: 'Autoscaling ML Services', file: 'mlops/model-serving/autoscaling-ml.html', links: ['mlops/model-serving/api-design-ml.html', 'mlops/model-serving/bentoml.html'] },
          { title: 'BentoML: Build and Ship ML Services', file: 'mlops/model-serving/bentoml.html', links: ['mlops/model-serving/autoscaling-ml.html', 'mlops/model-serving/blue-green-ml.html'] },
          { title: 'Blue-Green Deployments for ML', file: 'mlops/model-serving/blue-green-ml.html', links: ['mlops/model-serving/bentoml.html', 'mlops/model-serving/canary-deployments.html'] },
          { title: 'Canary Deployments for ML', file: 'mlops/model-serving/canary-deployments.html', links: ['mlops/model-serving/blue-green-ml.html', 'mlops/model-serving/edge-deployment.html'] },
          { title: 'Edge ML: TFLite, Core ML, ONNX Mobile', file: 'mlops/model-serving/edge-deployment.html', links: ['mlops/model-serving/canary-deployments.html', 'mlops/model-serving/inference-caching.html'] },
          { title: 'Inference Caching: Redis, Embeddings, Semantic Dedup', file: 'mlops/model-serving/inference-caching.html', links: ['mlops/model-serving/edge-deployment.html', 'mlops/model-serving/knowledge-distillation.html'] },
          { title: 'Knowledge Distillation', file: 'mlops/model-serving/knowledge-distillation.html', links: ['mlops/model-serving/inference-caching.html', 'mlops/model-serving/kserve.html'] },
          { title: 'KServe: Serverless ML on Kubernetes', file: 'mlops/model-serving/kserve.html', links: ['mlops/model-serving/knowledge-distillation.html', 'mlops/model-serving/latency-optimization.html'] },
          { title: 'Latency Optimization: Profiling and Bottlenecks', file: 'mlops/model-serving/latency-optimization.html', links: ['mlops/model-serving/kserve.html', 'mlops/model-serving/model-mesh.html'] },
          { title: 'Model Mesh: Serving Thousands of Models', file: 'mlops/model-serving/model-mesh.html', links: ['mlops/model-serving/latency-optimization.html', 'mlops/model-serving/model-optimization-quantization.html'] },
          { title: 'Quantization: INT8, INT4, Mixed Precision', file: 'mlops/model-serving/model-optimization-quantization.html', links: ['mlops/model-serving/model-mesh.html', 'mlops/model-serving/multi-armed-bandits.html'] },
          { title: 'Multi-Armed Bandits for Model Selection', file: 'mlops/model-serving/multi-armed-bandits.html', links: ['mlops/model-serving/model-optimization-quantization.html', 'mlops/model-serving/onnx-runtime.html'] },
          { title: 'ONNX Runtime Optimization', file: 'mlops/model-serving/onnx-runtime.html', links: ['mlops/model-serving/multi-armed-bandits.html', 'mlops/model-serving/pruning.html'] },
          { title: 'Model Pruning: Structured and Unstructured', file: 'mlops/model-serving/pruning.html', links: ['mlops/model-serving/onnx-runtime.html', 'mlops/model-serving/request-batching.html'] },
          { title: 'Request Batching: Dynamic Batching', file: 'mlops/model-serving/request-batching.html', links: ['mlops/model-serving/pruning.html', 'mlops/model-serving/seldon.html'] },
          { title: 'Seldon Core: K8s-Native Serving', file: 'mlops/model-serving/seldon.html', links: ['mlops/model-serving/request-batching.html', 'mlops/model-serving/serving-at-scale.html'] },
          { title: 'Serving at Scale: Google, Meta, Netflix', file: 'mlops/model-serving/serving-at-scale.html', links: ['mlops/model-serving/seldon.html', 'mlops/model-serving/serving-comparison.html'] },
          { title: 'Triton vs TorchServe vs BentoML vs KServe', file: 'mlops/model-serving/serving-comparison.html', links: ['mlops/model-serving/serving-at-scale.html', 'mlops/model-serving/serving-patterns.html'] },
          { title: 'Serving Patterns: Batch, Online, Streaming, Embedded', file: 'mlops/model-serving/serving-patterns.html', links: ['mlops/model-serving/serving-comparison.html', 'mlops/model-serving/shadow-mode.html'] },
          { title: 'Shadow Mode: Validate Before You Ship', file: 'mlops/model-serving/shadow-mode.html', links: ['mlops/model-serving/serving-patterns.html', 'mlops/model-serving/tf-serving.html'] },
          { title: 'TensorFlow Serving: Production Model Server', file: 'mlops/model-serving/tf-serving.html', links: ['mlops/model-serving/shadow-mode.html', 'mlops/model-serving/torchserve.html'] },
          { title: 'TorchServe: Serving PyTorch in Production', file: 'mlops/model-serving/torchserve.html', links: ['mlops/model-serving/tf-serving.html', 'mlops/model-serving/triton.html'] },
          { title: 'NVIDIA Triton: Multi-Framework Serving', file: 'mlops/model-serving/triton.html', links: ['mlops/model-serving/torchserve.html'] }
        ]
      },
      {
        name: 'monitoring',
        label: 'Monitoring',
        children: [
          { title: 'Alerting Strategies for ML Systems', file: 'mlops/monitoring/alerting-strategies.html', links: ['mlops/monitoring/concept-drift.html'] },
          { title: 'Concept Drift: When the World Changes', file: 'mlops/monitoring/concept-drift.html', links: ['mlops/monitoring/alerting-strategies.html', 'mlops/monitoring/data-drift.html'] },
          { title: 'Data Drift Detection: Statistical Methods', file: 'mlops/monitoring/data-drift.html', links: ['mlops/monitoring/concept-drift.html', 'mlops/monitoring/distributed-tracing-ml.html'] },
          { title: 'Distributed Tracing for ML Pipelines', file: 'mlops/monitoring/distributed-tracing-ml.html', links: ['mlops/monitoring/data-drift.html', 'mlops/monitoring/evidently-ai.html'] },
          { title: 'Evidently AI: Open Source ML Monitoring', file: 'mlops/monitoring/evidently-ai.html', links: ['mlops/monitoring/distributed-tracing-ml.html', 'mlops/monitoring/feature-drift.html'] },
          { title: 'Feature Drift Monitoring and Alerting', file: 'mlops/monitoring/feature-drift.html', links: ['mlops/monitoring/evidently-ai.html', 'mlops/monitoring/feedback-loops.html'] },
          { title: 'Feedback Loops: Predictions → Improvement', file: 'mlops/monitoring/feedback-loops.html', links: ['mlops/monitoring/feature-drift.html', 'mlops/monitoring/ground-truth-collection.html'] },
          { title: 'Ground Truth Collection and Delayed Labels', file: 'mlops/monitoring/ground-truth-collection.html', links: ['mlops/monitoring/feedback-loops.html', 'mlops/monitoring/incident-response-ml.html'] },
          { title: 'Incident Response for ML Systems', file: 'mlops/monitoring/incident-response-ml.html', links: ['mlops/monitoring/ground-truth-collection.html', 'mlops/monitoring/logging-ml.html'] },
          { title: 'Logging for ML: Structured, Request/Response', file: 'mlops/monitoring/logging-ml.html', links: ['mlops/monitoring/incident-response-ml.html', 'mlops/monitoring/monitoring-comparison.html'] },
          { title: 'Evidently vs whylogs vs NannyML vs Arize', file: 'mlops/monitoring/monitoring-comparison.html', links: ['mlops/monitoring/logging-ml.html', 'mlops/monitoring/monitoring-dashboards.html'] },
          { title: 'Building ML Monitoring Dashboards', file: 'mlops/monitoring/monitoring-dashboards.html', links: ['mlops/monitoring/monitoring-comparison.html', 'mlops/monitoring/monitoring-embeddings.html'] },
          { title: 'Monitoring Embedding Spaces', file: 'mlops/monitoring/monitoring-embeddings.html', links: ['mlops/monitoring/monitoring-dashboards.html', 'mlops/monitoring/monitoring-pipelines.html'] },
          { title: 'Monitoring ML Pipelines: Data, Training, Serving', file: 'mlops/monitoring/monitoring-pipelines.html', links: ['mlops/monitoring/monitoring-embeddings.html', 'mlops/monitoring/nannyml.html'] },
          { title: 'NannyML: Performance Without Ground Truth', file: 'mlops/monitoring/nannyml.html', links: ['mlops/monitoring/monitoring-pipelines.html', 'mlops/monitoring/observability-maturity.html'] },
          { title: 'ML Observability Maturity Model', file: 'mlops/monitoring/observability-maturity.html', links: ['mlops/monitoring/nannyml.html', 'mlops/monitoring/performance-degradation.html'] },
          { title: 'Detecting Model Performance Degradation', file: 'mlops/monitoring/performance-degradation.html', links: ['mlops/monitoring/observability-maturity.html', 'mlops/monitoring/prediction-monitoring.html'] },
          { title: 'Prediction Monitoring: Distribution Shifts', file: 'mlops/monitoring/prediction-monitoring.html', links: ['mlops/monitoring/performance-degradation.html', 'mlops/monitoring/prometheus-grafana-ml.html'] },
          { title: 'Prometheus + Grafana for ML Services', file: 'mlops/monitoring/prometheus-grafana-ml.html', links: ['mlops/monitoring/prediction-monitoring.html', 'mlops/monitoring/statistical-tests-drift.html'] },
          { title: 'Statistical Tests: KS, PSI, Chi-Square, MMD', file: 'mlops/monitoring/statistical-tests-drift.html', links: ['mlops/monitoring/prometheus-grafana-ml.html', 'mlops/monitoring/why-ml-monitoring.html'] },
          { title: 'Why ML Monitoring Differs from Software Monitoring', file: 'mlops/monitoring/why-ml-monitoring.html', links: ['mlops/monitoring/statistical-tests-drift.html', 'mlops/monitoring/whylogs.html'] },
          { title: 'whylogs: Data Logging and Profiling', file: 'mlops/monitoring/whylogs.html', links: ['mlops/monitoring/why-ml-monitoring.html'] }
        ]
      },
      {
        name: 'platform-engineering',
        label: 'Platform Engineering',
        children: [
          { title: 'AWS SageMaker: End-to-End ML', file: 'mlops/platform-engineering/aws-sagemaker.html', links: ['mlops/platform-engineering/azure-ml.html'] },
          { title: 'Azure ML: Microsoft\'s Platform', file: 'mlops/platform-engineering/azure-ml.html', links: ['mlops/platform-engineering/aws-sagemaker.html', 'mlops/platform-engineering/cloud-comparison-ml.html'] },
          { title: 'AWS vs GCP vs Azure for ML', file: 'mlops/platform-engineering/cloud-comparison-ml.html', links: ['mlops/platform-engineering/azure-ml.html', 'mlops/platform-engineering/cost-optimization.html'] },
          { title: 'Cost Optimization for ML Infrastructure', file: 'mlops/platform-engineering/cost-optimization.html', links: ['mlops/platform-engineering/cloud-comparison-ml.html', 'mlops/platform-engineering/dask.html'] },
          { title: 'Dask: Parallel Computing for Data Science', file: 'mlops/platform-engineering/dask.html', links: ['mlops/platform-engineering/cost-optimization.html', 'mlops/platform-engineering/docker-ml.html'] },
          { title: 'Docker Best Practices for ML', file: 'mlops/platform-engineering/docker-ml.html', links: ['mlops/platform-engineering/dask.html', 'mlops/platform-engineering/gcp-vertex-ai.html'] },
          { title: 'Google Vertex AI: Managed ML on GCP', file: 'mlops/platform-engineering/gcp-vertex-ai.html', links: ['mlops/platform-engineering/docker-ml.html', 'mlops/platform-engineering/gpu-cluster-management.html'] },
          { title: 'GPU Cluster Management', file: 'mlops/platform-engineering/gpu-cluster-management.html', links: ['mlops/platform-engineering/gcp-vertex-ai.html', 'mlops/platform-engineering/gpu-virtualization.html'] },
          { title: 'GPU Virtualization: MIG, MPS, Time-Slicing', file: 'mlops/platform-engineering/gpu-virtualization.html', links: ['mlops/platform-engineering/gpu-cluster-management.html', 'mlops/platform-engineering/helm-charts-ml.html'] },
          { title: 'Helm Charts for ML Infrastructure', file: 'mlops/platform-engineering/helm-charts-ml.html', links: ['mlops/platform-engineering/gpu-virtualization.html', 'mlops/platform-engineering/kubeflow.html'] },
          { title: 'Kubeflow: ML Toolkit for Kubernetes', file: 'mlops/platform-engineering/kubeflow.html', links: ['mlops/platform-engineering/helm-charts-ml.html', 'mlops/platform-engineering/kubernetes-ml.html'] },
          { title: 'Kubernetes for ML: Pods, Jobs, GPU Scheduling', file: 'mlops/platform-engineering/kubernetes-ml.html', links: ['mlops/platform-engineering/kubeflow.html', 'mlops/platform-engineering/ml-platform-design.html'] },
          { title: 'Designing an Internal ML Platform', file: 'mlops/platform-engineering/ml-platform-design.html', links: ['mlops/platform-engineering/kubernetes-ml.html', 'mlops/platform-engineering/multi-cloud-ml.html'] },
          { title: 'Multi-Cloud ML Architecture', file: 'mlops/platform-engineering/multi-cloud-ml.html', links: ['mlops/platform-engineering/ml-platform-design.html', 'mlops/platform-engineering/networking-ml.html'] },
          { title: 'Networking: InfiniBand, RoCE, High-Bandwidth', file: 'mlops/platform-engineering/networking-ml.html', links: ['mlops/platform-engineering/multi-cloud-ml.html', 'mlops/platform-engineering/ray-vs-dask-vs-spark.html'] },
          { title: 'Ray vs Dask vs Spark', file: 'mlops/platform-engineering/ray-vs-dask-vs-spark.html', links: ['mlops/platform-engineering/networking-ml.html', 'mlops/platform-engineering/ray.html'] },
          { title: 'Ray: Distributed Computing for ML', file: 'mlops/platform-engineering/ray.html', links: ['mlops/platform-engineering/ray-vs-dask-vs-spark.html', 'mlops/platform-engineering/secrets-management.html'] },
          { title: 'Secrets Management for ML', file: 'mlops/platform-engineering/secrets-management.html', links: ['mlops/platform-engineering/ray.html', 'mlops/platform-engineering/self-service-ml.html'] },
          { title: 'Self-Service ML: Enabling Data Scientists', file: 'mlops/platform-engineering/self-service-ml.html', links: ['mlops/platform-engineering/secrets-management.html', 'mlops/platform-engineering/spot-preemptible-strategy.html'] },
          { title: 'Spot Instance Strategy for ML', file: 'mlops/platform-engineering/spot-preemptible-strategy.html', links: ['mlops/platform-engineering/self-service-ml.html', 'mlops/platform-engineering/storage-for-ml.html'] },
          { title: 'Storage for ML: Object Stores, NFS, HPC', file: 'mlops/platform-engineering/storage-for-ml.html', links: ['mlops/platform-engineering/spot-preemptible-strategy.html', 'mlops/platform-engineering/terraform-ml.html'] },
          { title: 'Terraform for ML: IaC Patterns', file: 'mlops/platform-engineering/terraform-ml.html', links: ['mlops/platform-engineering/storage-for-ml.html'] }
        ]
      },
      {
        name: 'security-governance',
        label: 'Security & Governance',
        children: [
          { title: 'Access Control for ML Assets', file: 'mlops/security-governance/access-control-ml.html', links: ['mlops/security-governance/adversarial-attacks.html'] },
          { title: 'Adversarial Attacks: Evasion, Poisoning, Backdoors', file: 'mlops/security-governance/adversarial-attacks.html', links: ['mlops/security-governance/access-control-ml.html', 'mlops/security-governance/adversarial-defenses.html'] },
          { title: 'Adversarial Defenses: Robustness and Detection', file: 'mlops/security-governance/adversarial-defenses.html', links: ['mlops/security-governance/adversarial-attacks.html', 'mlops/security-governance/audit-logging.html'] },
          { title: 'Audit Logging for ML Systems', file: 'mlops/security-governance/audit-logging.html', links: ['mlops/security-governance/adversarial-defenses.html', 'mlops/security-governance/compliance-frameworks.html'] },
          { title: 'Compliance: EU AI Act, NIST, ISO', file: 'mlops/security-governance/compliance-frameworks.html', links: ['mlops/security-governance/audit-logging.html', 'mlops/security-governance/data-poisoning.html'] },
          { title: 'Data Poisoning: Attacks and Defenses', file: 'mlops/security-governance/data-poisoning.html', links: ['mlops/security-governance/compliance-frameworks.html', 'mlops/security-governance/differential-privacy.html'] },
          { title: 'Differential Privacy for ML', file: 'mlops/security-governance/differential-privacy.html', links: ['mlops/security-governance/data-poisoning.html', 'mlops/security-governance/explainability.html'] },
          { title: 'Explainability: SHAP, LIME, Integrated Gradients', file: 'mlops/security-governance/explainability.html', links: ['mlops/security-governance/differential-privacy.html', 'mlops/security-governance/fairness-ml.html'] },
          { title: 'Fairness in ML: Metrics, Bias Detection', file: 'mlops/security-governance/fairness-ml.html', links: ['mlops/security-governance/explainability.html', 'mlops/security-governance/federated-learning.html'] },
          { title: 'Federated Learning: No Data Sharing', file: 'mlops/security-governance/federated-learning.html', links: ['mlops/security-governance/fairness-ml.html', 'mlops/security-governance/gdpr-ml.html'] },
          { title: 'GDPR for ML: Right to Explanation, Erasure', file: 'mlops/security-governance/gdpr-ml.html', links: ['mlops/security-governance/federated-learning.html', 'mlops/security-governance/ml-security-overview.html'] },
          { title: 'ML Security: Threat Landscape', file: 'mlops/security-governance/ml-security-overview.html', links: ['mlops/security-governance/gdpr-ml.html', 'mlops/security-governance/model-governance.html'] },
          { title: 'Model Governance: Policies, Approvals, Audit', file: 'mlops/security-governance/model-governance.html', links: ['mlops/security-governance/ml-security-overview.html', 'mlops/security-governance/model-stealing.html'] },
          { title: 'Model Stealing and Extraction', file: 'mlops/security-governance/model-stealing.html', links: ['mlops/security-governance/model-governance.html', 'mlops/security-governance/red-teaming-ml.html'] },
          { title: 'Red Teaming ML Systems', file: 'mlops/security-governance/red-teaming-ml.html', links: ['mlops/security-governance/model-stealing.html', 'mlops/security-governance/responsible-ai.html'] },
          { title: 'Responsible AI: Frameworks and Best Practices', file: 'mlops/security-governance/responsible-ai.html', links: ['mlops/security-governance/red-teaming-ml.html', 'mlops/security-governance/secure-aggregation.html'] },
          { title: 'Secure Aggregation and MPC for ML', file: 'mlops/security-governance/secure-aggregation.html', links: ['mlops/security-governance/responsible-ai.html', 'mlops/security-governance/supply-chain-security.html'] },
          { title: 'ML Supply Chain Security', file: 'mlops/security-governance/supply-chain-security.html', links: ['mlops/security-governance/secure-aggregation.html'] }
        ]
      },
      {
        name: 'system-design',
        label: 'System Design',
        children: [
          { title: 'Design: A/B Testing &amp; Experimentation', file: 'mlops/system-design/ab-testing-platform.html', links: ['mlops/system-design/ads-ranking.html'] },
          { title: 'Design: Ads Ranking and Click Prediction', file: 'mlops/system-design/ads-ranking.html', links: ['mlops/system-design/ab-testing-platform.html', 'mlops/system-design/anomaly-detection.html'] },
          { title: 'Design: Anomaly Detection Platform', file: 'mlops/system-design/anomaly-detection.html', links: ['mlops/system-design/ads-ranking.html', 'mlops/system-design/batch-prediction.html'] },
          { title: 'Design: Batch Prediction Pipeline', file: 'mlops/system-design/batch-prediction.html', links: ['mlops/system-design/anomaly-detection.html', 'mlops/system-design/content-moderation.html'] },
          { title: 'Design: Content Moderation Pipeline', file: 'mlops/system-design/content-moderation.html', links: ['mlops/system-design/batch-prediction.html', 'mlops/system-design/embedding-service.html'] },
          { title: 'Design: Embedding Service', file: 'mlops/system-design/embedding-service.html', links: ['mlops/system-design/content-moderation.html', 'mlops/system-design/feature-platform.html'] },
          { title: 'Design: Feature Platform (Uber Michelangelo)', file: 'mlops/system-design/feature-platform.html', links: ['mlops/system-design/embedding-service.html', 'mlops/system-design/fraud-detection.html'] },
          { title: 'Design: Real-Time Fraud Detection', file: 'mlops/system-design/fraud-detection.html', links: ['mlops/system-design/feature-platform.html', 'mlops/system-design/ml-platform-uber.html'] },
          { title: 'Case Study: Uber Michelangelo, Meta FBLearner, Google TFX', file: 'mlops/system-design/ml-platform-uber.html', links: ['mlops/system-design/fraud-detection.html', 'mlops/system-design/newsfeed-ranking.html'] },
          { title: 'Design: News Feed Ranking', file: 'mlops/system-design/newsfeed-ranking.html', links: ['mlops/system-design/ml-platform-uber.html', 'mlops/system-design/realtime-ml.html'] },
          { title: 'Design: Real-Time ML Inference Platform', file: 'mlops/system-design/realtime-ml.html', links: ['mlops/system-design/newsfeed-ranking.html', 'mlops/system-design/recommendation-system.html'] },
          { title: 'Design: Recommendation Engine (Netflix/YouTube)', file: 'mlops/system-design/recommendation-system.html', links: ['mlops/system-design/realtime-ml.html', 'mlops/system-design/search-ranking.html'] },
          { title: 'Design: Search Ranking System', file: 'mlops/system-design/search-ranking.html', links: ['mlops/system-design/recommendation-system.html', 'mlops/system-design/spam-detection.html'] },
          { title: 'Design: Email/Message Spam Detection', file: 'mlops/system-design/spam-detection.html', links: ['mlops/system-design/search-ranking.html', 'mlops/system-design/training-platform.html'] },
          { title: 'Design: ML Training Platform', file: 'mlops/system-design/training-platform.html', links: ['mlops/system-design/spam-detection.html'] }
        ]
      },
      {
        name: 'llm-fundamentals',
        label: 'LLM Fundamentals',
        children: [
          { title: 'Adapter Methods: Prefix Tuning, P-Tuning, IA3', file: 'mlops/llm-fundamentals/adapter-methods.html', links: ['mlops/llm-fundamentals/alignment-landscape.html'] },
          { title: 'The Alignment Landscape: RLHF, DPO, KTO, ORPO, and Beyond', file: 'mlops/llm-fundamentals/alignment-landscape.html', links: ['mlops/llm-fundamentals/adapter-methods.html', 'mlops/llm-fundamentals/attention-memory.html'] },
          { title: 'Attention Memory Costs: Why Context Length Matters for Infra', file: 'mlops/llm-fundamentals/attention-memory.html', links: ['mlops/llm-fundamentals/alignment-landscape.html', 'mlops/llm-fundamentals/dpo.html'] },
          { title: 'DPO: Direct Preference Optimization', file: 'mlops/llm-fundamentals/dpo.html', links: ['mlops/llm-fundamentals/attention-memory.html', 'mlops/llm-fundamentals/fine-tuning-overview.html'] },
          { title: 'Fine-Tuning LLMs: Full, Freeze, and Parameter-Efficient', file: 'mlops/llm-fundamentals/fine-tuning-overview.html', links: ['mlops/llm-fundamentals/dpo.html', 'mlops/llm-fundamentals/instruction-tuning.html'] },
          { title: 'Instruction Tuning: SFT Data, Formatting, and Best Practices', file: 'mlops/llm-fundamentals/instruction-tuning.html', links: ['mlops/llm-fundamentals/fine-tuning-overview.html', 'mlops/llm-fundamentals/lora.html'] },
          { title: 'LoRA and QLoRA: Parameter-Efficient Fine-Tuning', file: 'mlops/llm-fundamentals/lora.html', links: ['mlops/llm-fundamentals/instruction-tuning.html', 'mlops/llm-fundamentals/model-sizes.html'] },
          { title: 'Model Sizes: Parameters, Memory, and Compute Requirements', file: 'mlops/llm-fundamentals/model-sizes.html', links: ['mlops/llm-fundamentals/lora.html', 'mlops/llm-fundamentals/pretraining-overview.html'] },
          { title: 'Pre-Training LLMs: Data, Compute, and Curriculum', file: 'mlops/llm-fundamentals/pretraining-overview.html', links: ['mlops/llm-fundamentals/model-sizes.html', 'mlops/llm-fundamentals/rlhf-overview.html'] },
          { title: 'RLHF: Reinforcement Learning from Human Feedback', file: 'mlops/llm-fundamentals/rlhf-overview.html', links: ['mlops/llm-fundamentals/pretraining-overview.html', 'mlops/llm-fundamentals/tokenization.html'] },
          { title: 'Tokenization: BPE, WordPiece, SentencePiece, and Tiktoken', file: 'mlops/llm-fundamentals/tokenization.html', links: ['mlops/llm-fundamentals/rlhf-overview.html', 'mlops/llm-fundamentals/transformer-ops-view.html'] },
          { title: 'Transformer Architecture: An Ops Engineer\'s Perspective', file: 'mlops/llm-fundamentals/transformer-ops-view.html', links: ['mlops/llm-fundamentals/tokenization.html'] }
        ]
      },
      {
        name: 'llm-training',
        label: 'LLM Training',
        children: [
          { title: '3D Parallelism: Data + Tensor + Pipeline', file: 'mlops/llm-training/3d-parallelism.html', links: ['mlops/llm-training/checkpoint-management.html'] },
          { title: 'Checkpoint Management: Distributed, Async I/O', file: 'mlops/llm-training/checkpoint-management.html', links: ['mlops/llm-training/3d-parallelism.html', 'mlops/llm-training/curriculum-learning.html'] },
          { title: 'Curriculum Learning: Data Ordering and Mixing', file: 'mlops/llm-training/curriculum-learning.html', links: ['mlops/llm-training/checkpoint-management.html', 'mlops/llm-training/data-deduplication.html'] },
          { title: 'Data Dedup: MinHash, Exact, Fuzzy', file: 'mlops/llm-training/data-deduplication.html', links: ['mlops/llm-training/curriculum-learning.html', 'mlops/llm-training/data-quality-llm.html'] },
          { title: 'Data Quality: Toxicity Filtering, PII Removal', file: 'mlops/llm-training/data-quality-llm.html', links: ['mlops/llm-training/data-deduplication.html', 'mlops/llm-training/deepspeed-llm.html'] },
          { title: 'DeepSpeed for LLMs: ZeRO-3, ZeRO-Infinity', file: 'mlops/llm-training/deepspeed-llm.html', links: ['mlops/llm-training/data-quality-llm.html', 'mlops/llm-training/dpo-infra.html'] },
          { title: 'DPO Training Infrastructure', file: 'mlops/llm-training/dpo-infra.html', links: ['mlops/llm-training/deepspeed-llm.html', 'mlops/llm-training/expert-parallelism.html'] },
          { title: 'Expert Parallelism for MoE', file: 'mlops/llm-training/expert-parallelism.html', links: ['mlops/llm-training/dpo-infra.html', 'mlops/llm-training/flash-attention.html'] },
          { title: 'FlashAttention: Memory-Efficient Attention', file: 'mlops/llm-training/flash-attention.html', links: ['mlops/llm-training/expert-parallelism.html', 'mlops/llm-training/fsdp-llm.html'] },
          { title: 'FSDP for LLM Training', file: 'mlops/llm-training/fsdp-llm.html', links: ['mlops/llm-training/flash-attention.html', 'mlops/llm-training/megatron-lm.html'] },
          { title: 'Megatron-LM: 3D Parallelism', file: 'mlops/llm-training/megatron-lm.html', links: ['mlops/llm-training/fsdp-llm.html', 'mlops/llm-training/multi-node-training.html'] },
          { title: 'Multi-Node Training: NVLink, NVSwitch', file: 'mlops/llm-training/multi-node-training.html', links: ['mlops/llm-training/megatron-lm.html', 'mlops/llm-training/pretraining-infra.html'] },
          { title: 'Pre-Training Infrastructure: GPU Clusters', file: 'mlops/llm-training/pretraining-infra.html', links: ['mlops/llm-training/multi-node-training.html', 'mlops/llm-training/reward-model-training.html'] },
          { title: 'Training Reward Models for RLHF', file: 'mlops/llm-training/reward-model-training.html', links: ['mlops/llm-training/pretraining-infra.html', 'mlops/llm-training/rlhf-infra.html'] },
          { title: 'RLHF Infrastructure: PPO at Scale', file: 'mlops/llm-training/rlhf-infra.html', links: ['mlops/llm-training/reward-model-training.html', 'mlops/llm-training/sequence-parallelism.html'] },
          { title: 'Sequence and Context Parallelism', file: 'mlops/llm-training/sequence-parallelism.html', links: ['mlops/llm-training/rlhf-infra.html', 'mlops/llm-training/training-cost-estimation.html'] },
          { title: 'LLM Training Cost Estimation', file: 'mlops/llm-training/training-cost-estimation.html', links: ['mlops/llm-training/sequence-parallelism.html', 'mlops/llm-training/training-data-pipeline.html'] },
          { title: 'LLM Data Pipeline: Dedup, Filter, Mix', file: 'mlops/llm-training/training-data-pipeline.html', links: ['mlops/llm-training/training-cost-estimation.html', 'mlops/llm-training/training-efficiency.html'] },
          { title: 'Training Efficiency: Tokens/Second, MFU', file: 'mlops/llm-training/training-efficiency.html', links: ['mlops/llm-training/training-data-pipeline.html', 'mlops/llm-training/training-stability.html'] },
          { title: 'Training Stability: Loss Spikes, NaN, Recovery', file: 'mlops/llm-training/training-stability.html', links: ['mlops/llm-training/training-efficiency.html'] }
        ]
      },
      {
        name: 'llm-inference',
        label: 'LLM Inference',
        children: [
          { title: 'Autoscaling LLM Services', file: 'mlops/llm-inference/autoscaling-llm.html', links: ['mlops/llm-inference/continuous-batching.html'] },
          { title: 'Continuous Batching: Maximizing GPU Utilization', file: 'mlops/llm-inference/continuous-batching.html', links: ['mlops/llm-inference/autoscaling-llm.html', 'mlops/llm-inference/disaggregated-inference.html'] },
          { title: 'Disaggregated Inference', file: 'mlops/llm-inference/disaggregated-inference.html', links: ['mlops/llm-inference/continuous-batching.html', 'mlops/llm-inference/function-calling-infra.html'] },
          { title: 'Function Calling Infrastructure', file: 'mlops/llm-inference/function-calling-infra.html', links: ['mlops/llm-inference/disaggregated-inference.html', 'mlops/llm-inference/inference-benchmarking.html'] },
          { title: 'LLM Benchmarking: Latency, Throughput, TTFT, TPS', file: 'mlops/llm-inference/inference-benchmarking.html', links: ['mlops/llm-inference/function-calling-infra.html', 'mlops/llm-inference/inference-cost-optimization.html'] },
          { title: 'LLM Inference Cost: Tokens/Dollar', file: 'mlops/llm-inference/inference-cost-optimization.html', links: ['mlops/llm-inference/inference-benchmarking.html', 'mlops/llm-inference/kv-cache.html'] },
          { title: 'KV Cache Deep Dive', file: 'mlops/llm-inference/kv-cache.html', links: ['mlops/llm-inference/inference-cost-optimization.html', 'mlops/llm-inference/llm-inference-fundamentals.html'] },
          { title: 'LLM Inference: Prefill, Decode, and KV Cache', file: 'mlops/llm-inference/llm-inference-fundamentals.html', links: ['mlops/llm-inference/kv-cache.html', 'mlops/llm-inference/llm-serving-comparison.html'] },
          { title: 'vLLM vs TGI vs TensorRT-LLM vs Triton', file: 'mlops/llm-inference/llm-serving-comparison.html', links: ['mlops/llm-inference/llm-inference-fundamentals.html', 'mlops/llm-inference/load-balancing-llm.html'] },
          { title: 'Load Balancing for LLM Services', file: 'mlops/llm-inference/load-balancing-llm.html', links: ['mlops/llm-inference/llm-serving-comparison.html', 'mlops/llm-inference/long-context-serving.html'] },
          { title: 'Serving Long-Context LLMs', file: 'mlops/llm-inference/long-context-serving.html', links: ['mlops/llm-inference/load-balancing-llm.html', 'mlops/llm-inference/multi-model-serving.html'] },
          { title: 'Multi-Model Serving: LoRA Adapters', file: 'mlops/llm-inference/multi-model-serving.html', links: ['mlops/llm-inference/long-context-serving.html', 'mlops/llm-inference/paged-attention.html'] },
          { title: 'PagedAttention and vLLM', file: 'mlops/llm-inference/paged-attention.html', links: ['mlops/llm-inference/multi-model-serving.html', 'mlops/llm-inference/prefix-caching.html'] },
          { title: 'Prefix Caching: Reusing KV Cache', file: 'mlops/llm-inference/prefix-caching.html', links: ['mlops/llm-inference/paged-attention.html', 'mlops/llm-inference/quantization-awq.html'] },
          { title: 'AWQ: Activation-Aware Quantization', file: 'mlops/llm-inference/quantization-awq.html', links: ['mlops/llm-inference/prefix-caching.html', 'mlops/llm-inference/quantization-comparison.html'] },
          { title: 'LLM Quantization Comparison', file: 'mlops/llm-inference/quantization-comparison.html', links: ['mlops/llm-inference/quantization-awq.html', 'mlops/llm-inference/quantization-gguf.html'] },
          { title: 'GGUF and llama.cpp', file: 'mlops/llm-inference/quantization-gguf.html', links: ['mlops/llm-inference/quantization-comparison.html', 'mlops/llm-inference/quantization-gptq.html'] },
          { title: 'GPTQ: Post-Training INT4', file: 'mlops/llm-inference/quantization-gptq.html', links: ['mlops/llm-inference/quantization-gguf.html', 'mlops/llm-inference/speculative-decoding.html'] },
          { title: 'Speculative Decoding', file: 'mlops/llm-inference/speculative-decoding.html', links: ['mlops/llm-inference/quantization-gptq.html', 'mlops/llm-inference/structured-output.html'] },
          { title: 'Structured Output: JSON Mode, Constrained Decoding', file: 'mlops/llm-inference/structured-output.html', links: ['mlops/llm-inference/speculative-decoding.html', 'mlops/llm-inference/tensorrt-llm.html'] },
          { title: 'TensorRT-LLM: NVIDIA\'s Runtime', file: 'mlops/llm-inference/tensorrt-llm.html', links: ['mlops/llm-inference/structured-output.html', 'mlops/llm-inference/tgi.html'] },
          { title: 'Text Generation Inference (TGI)', file: 'mlops/llm-inference/tgi.html', links: ['mlops/llm-inference/tensorrt-llm.html', 'mlops/llm-inference/token-streaming.html'] },
          { title: 'Token Streaming: SSE, WebSocket, gRPC', file: 'mlops/llm-inference/token-streaming.html', links: ['mlops/llm-inference/tgi.html', 'mlops/llm-inference/vllm.html'] },
          { title: 'vLLM: High-Throughput LLM Serving', file: 'mlops/llm-inference/vllm.html', links: ['mlops/llm-inference/token-streaming.html'] }
        ]
      },
      {
        name: 'prompt-engineering',
        label: 'Prompt Engineering',
        children: [
          { title: 'Chain-of-Thought: Reasoning in LLMs', file: 'mlops/prompt-engineering/chain-of-thought.html', links: ['mlops/prompt-engineering/few-shot-prompting.html'] },
          { title: 'Few-Shot Prompting: In-Context Learning', file: 'mlops/prompt-engineering/few-shot-prompting.html', links: ['mlops/prompt-engineering/chain-of-thought.html', 'mlops/prompt-engineering/jailbreak-defenses.html'] },
          { title: 'Jailbreak Defenses: Constitutional AI, Guardrails', file: 'mlops/prompt-engineering/jailbreak-defenses.html', links: ['mlops/prompt-engineering/few-shot-prompting.html', 'mlops/prompt-engineering/prompt-caching.html'] },
          { title: 'Prompt Caching: Reducing Latency and Cost', file: 'mlops/prompt-engineering/prompt-caching.html', links: ['mlops/prompt-engineering/jailbreak-defenses.html', 'mlops/prompt-engineering/prompt-compression.html'] },
          { title: 'Prompt Compression: LLMLingua, Context Distillation', file: 'mlops/prompt-engineering/prompt-compression.html', links: ['mlops/prompt-engineering/prompt-caching.html', 'mlops/prompt-engineering/prompt-engineering-fundamentals.html'] },
          { title: 'Prompt Engineering Fundamentals', file: 'mlops/prompt-engineering/prompt-engineering-fundamentals.html', links: ['mlops/prompt-engineering/prompt-compression.html', 'mlops/prompt-engineering/prompt-injection.html'] },
          { title: 'Prompt Injection: Detection and Defense', file: 'mlops/prompt-engineering/prompt-injection.html', links: ['mlops/prompt-engineering/prompt-engineering-fundamentals.html', 'mlops/prompt-engineering/prompt-observability.html'] },
          { title: 'Prompt Observability: Logging and Analytics', file: 'mlops/prompt-engineering/prompt-observability.html', links: ['mlops/prompt-engineering/prompt-injection.html', 'mlops/prompt-engineering/prompt-optimization.html'] },
          { title: 'Prompt Optimization: DSPy and Auto-Tuning', file: 'mlops/prompt-engineering/prompt-optimization.html', links: ['mlops/prompt-engineering/prompt-observability.html', 'mlops/prompt-engineering/prompt-routing.html'] },
          { title: 'Prompt Routing: Model Selection by Query', file: 'mlops/prompt-engineering/prompt-routing.html', links: ['mlops/prompt-engineering/prompt-optimization.html', 'mlops/prompt-engineering/prompt-testing.html'] },
          { title: 'Prompt Testing: Automated Evaluation', file: 'mlops/prompt-engineering/prompt-testing.html', links: ['mlops/prompt-engineering/prompt-routing.html', 'mlops/prompt-engineering/prompt-versioning.html'] },
          { title: 'Prompt Versioning: Managing Prompts as Code', file: 'mlops/prompt-engineering/prompt-versioning.html', links: ['mlops/prompt-engineering/prompt-testing.html', 'mlops/prompt-engineering/structured-prompting.html'] },
          { title: 'Structured Prompting: Templates and Composition', file: 'mlops/prompt-engineering/structured-prompting.html', links: ['mlops/prompt-engineering/prompt-versioning.html', 'mlops/prompt-engineering/system-prompts.html'] },
          { title: 'System Prompts: Design, Security, Management', file: 'mlops/prompt-engineering/system-prompts.html', links: ['mlops/prompt-engineering/structured-prompting.html'] }
        ]
      },
      {
        name: 'rag',
        label: 'RAG',
        children: [
          { title: 'Advanced RAG: Self-RAG, CRAG, Adaptive', file: 'mlops/rag/advanced-rag.html', links: ['mlops/rag/bm25-hybrid.html'] },
          { title: 'BM25 + Dense Hybrid: Best of Both Worlds', file: 'mlops/rag/bm25-hybrid.html', links: ['mlops/rag/advanced-rag.html', 'mlops/rag/chunking-strategies.html'] },
          { title: 'Chunking: Fixed, Semantic, Recursive, Agentic', file: 'mlops/rag/chunking-strategies.html', links: ['mlops/rag/bm25-hybrid.html', 'mlops/rag/citation-grounding.html'] },
          { title: 'Citation and Grounding: Attributing Answers', file: 'mlops/rag/citation-grounding.html', links: ['mlops/rag/chunking-strategies.html', 'mlops/rag/document-processing.html'] },
          { title: 'Document Processing: PDF, HTML, Unstructured', file: 'mlops/rag/document-processing.html', links: ['mlops/rag/citation-grounding.html', 'mlops/rag/embedding-models.html'] },
          { title: 'Embedding Models: OpenAI, Cohere, BGE, E5', file: 'mlops/rag/embedding-models.html', links: ['mlops/rag/document-processing.html', 'mlops/rag/indexing-strategies.html'] },
          { title: 'Indexing: HNSW, IVF, Product Quantization', file: 'mlops/rag/indexing-strategies.html', links: ['mlops/rag/embedding-models.html', 'mlops/rag/knowledge-graphs-rag.html'] },
          { title: 'Knowledge Graphs + RAG: GraphRAG', file: 'mlops/rag/knowledge-graphs-rag.html', links: ['mlops/rag/indexing-strategies.html', 'mlops/rag/multi-modal-rag.html'] },
          { title: 'Multi-Modal RAG: Images, Tables, Documents', file: 'mlops/rag/multi-modal-rag.html', links: ['mlops/rag/knowledge-graphs-rag.html', 'mlops/rag/query-transformation.html'] },
          { title: 'Query Transform: HyDE, Multi-Query, Step-Back', file: 'mlops/rag/query-transformation.html', links: ['mlops/rag/multi-modal-rag.html', 'mlops/rag/rag-at-scale.html'] },
          { title: 'RAG at Scale: Caching, Streaming, Multi-Tenant', file: 'mlops/rag/rag-at-scale.html', links: ['mlops/rag/query-transformation.html', 'mlops/rag/rag-evaluation.html'] },
          { title: 'RAG Evaluation: Faithfulness, Relevance, RAGAS', file: 'mlops/rag/rag-evaluation.html', links: ['mlops/rag/rag-at-scale.html', 'mlops/rag/rag-fundamentals.html'] },
          { title: 'RAG Fundamentals', file: 'mlops/rag/rag-fundamentals.html', links: ['mlops/rag/rag-evaluation.html', 'mlops/rag/rag-pipelines.html'] },
          { title: 'RAG Pipelines: LangChain, LlamaIndex, Haystack', file: 'mlops/rag/rag-pipelines.html', links: ['mlops/rag/rag-fundamentals.html', 'mlops/rag/rag-security.html'] },
          { title: 'RAG Security: Data Leakage, Access Control, PII', file: 'mlops/rag/rag-security.html', links: ['mlops/rag/rag-pipelines.html', 'mlops/rag/rag-vs-fine-tuning.html'] },
          { title: 'RAG vs Fine-Tuning: When to Use Which', file: 'mlops/rag/rag-vs-fine-tuning.html', links: ['mlops/rag/rag-security.html', 'mlops/rag/reranking.html'] },
          { title: 'Reranking: Cross-Encoders, ColBERT, Cohere', file: 'mlops/rag/reranking.html', links: ['mlops/rag/rag-vs-fine-tuning.html', 'mlops/rag/retrieval-patterns.html'] },
          { title: 'Retrieval: Dense, Sparse, Hybrid', file: 'mlops/rag/retrieval-patterns.html', links: ['mlops/rag/reranking.html', 'mlops/rag/vector-databases.html'] },
          { title: 'Vector DBs: Pinecone, Weaviate, Qdrant, Milvus, Chroma', file: 'mlops/rag/vector-databases.html', links: ['mlops/rag/retrieval-patterns.html', 'mlops/rag/vector-db-comparison.html'] },
          { title: 'Vector DB Comparison', file: 'mlops/rag/vector-db-comparison.html', links: ['mlops/rag/vector-databases.html'] }
        ]
      },
      {
        name: 'llm-evaluation',
        label: 'LLM Evaluation',
        children: [
          { title: 'Benchmarks: MMLU, HumanEval, GSM8K', file: 'mlops/llm-evaluation/benchmarks.html', links: ['mlops/llm-evaluation/capability-evaluation.html'] },
          { title: 'Capability Eval: Reasoning, Coding, Domain', file: 'mlops/llm-evaluation/capability-evaluation.html', links: ['mlops/llm-evaluation/benchmarks.html', 'mlops/llm-evaluation/constitutional-ai.html'] },
          { title: 'Constitutional AI: Self-Supervised Alignment', file: 'mlops/llm-evaluation/constitutional-ai.html', links: ['mlops/llm-evaluation/capability-evaluation.html', 'mlops/llm-evaluation/content-filtering.html'] },
          { title: 'Content Filtering: Input/Output Moderation', file: 'mlops/llm-evaluation/content-filtering.html', links: ['mlops/llm-evaluation/constitutional-ai.html', 'mlops/llm-evaluation/eval-data-curation.html'] },
          { title: 'Eval Data Curation: High-Quality Test Sets', file: 'mlops/llm-evaluation/eval-data-curation.html', links: ['mlops/llm-evaluation/content-filtering.html', 'mlops/llm-evaluation/eval-frameworks.html'] },
          { title: 'Eval Frameworks: lm-eval-harness, OpenAI Evals', file: 'mlops/llm-evaluation/eval-frameworks.html', links: ['mlops/llm-evaluation/eval-data-curation.html', 'mlops/llm-evaluation/eval-fundamentals.html'] },
          { title: 'LLM Evaluation Fundamentals', file: 'mlops/llm-evaluation/eval-fundamentals.html', links: ['mlops/llm-evaluation/eval-frameworks.html', 'mlops/llm-evaluation/eval-pipelines.html'] },
          { title: 'LLM Evaluation Pipelines: CI/CD for Quality', file: 'mlops/llm-evaluation/eval-pipelines.html', links: ['mlops/llm-evaluation/eval-fundamentals.html', 'mlops/llm-evaluation/factuality.html'] },
          { title: 'Factuality: Grounding, Verification, Attribution', file: 'mlops/llm-evaluation/factuality.html', links: ['mlops/llm-evaluation/eval-pipelines.html', 'mlops/llm-evaluation/guardrails.html'] },
          { title: 'Guardrails: NeMo, Guardrails AI, Custom Filters', file: 'mlops/llm-evaluation/guardrails.html', links: ['mlops/llm-evaluation/factuality.html', 'mlops/llm-evaluation/hallucination-detection.html'] },
          { title: 'Hallucination Detection and Mitigation', file: 'mlops/llm-evaluation/hallucination-detection.html', links: ['mlops/llm-evaluation/guardrails.html', 'mlops/llm-evaluation/human-evaluation.html'] },
          { title: 'Human Evaluation: Protocols and Scaling', file: 'mlops/llm-evaluation/human-evaluation.html', links: ['mlops/llm-evaluation/hallucination-detection.html', 'mlops/llm-evaluation/llm-as-judge.html'] },
          { title: 'LLM-as-Judge: Automated Evaluation', file: 'mlops/llm-evaluation/llm-as-judge.html', links: ['mlops/llm-evaluation/human-evaluation.html', 'mlops/llm-evaluation/red-teaming-llm.html'] },
          { title: 'Red Teaming LLMs: Methodology and Tools', file: 'mlops/llm-evaluation/red-teaming-llm.html', links: ['mlops/llm-evaluation/llm-as-judge.html', 'mlops/llm-evaluation/regression-testing-llm.html'] },
          { title: 'Regression Testing for LLMs', file: 'mlops/llm-evaluation/regression-testing-llm.html', links: ['mlops/llm-evaluation/red-teaming-llm.html', 'mlops/llm-evaluation/safety-evaluation.html'] },
          { title: 'Safety Evaluation: Toxicity, Bias, Harmful Content', file: 'mlops/llm-evaluation/safety-evaluation.html', links: ['mlops/llm-evaluation/regression-testing-llm.html'] }
        ]
      },
      {
        name: 'llm-agents',
        label: 'LLM Agents',
        children: [
          { title: 'Agent Cost: Token Budgets and Optimization', file: 'mlops/llm-agents/agent-cost-management.html', links: ['mlops/llm-agents/agent-deployment.html'] },
          { title: 'Deploying LLM Agents in Production', file: 'mlops/llm-agents/agent-deployment.html', links: ['mlops/llm-agents/agent-cost-management.html', 'mlops/llm-agents/agent-error-handling.html'] },
          { title: 'Agent Error Handling: Retries and Fallbacks', file: 'mlops/llm-agents/agent-error-handling.html', links: ['mlops/llm-agents/agent-deployment.html', 'mlops/llm-agents/agent-evaluation.html'] },
          { title: 'Agent Evaluation: Task Completion and Safety', file: 'mlops/llm-agents/agent-evaluation.html', links: ['mlops/llm-agents/agent-error-handling.html', 'mlops/llm-agents/agent-frameworks.html'] },
          { title: 'Frameworks: LangChain, LangGraph, CrewAI, AutoGen', file: 'mlops/llm-agents/agent-frameworks.html', links: ['mlops/llm-agents/agent-evaluation.html', 'mlops/llm-agents/agent-fundamentals.html'] },
          { title: 'Agent Fundamentals: ReAct, Plan-and-Execute', file: 'mlops/llm-agents/agent-fundamentals.html', links: ['mlops/llm-agents/agent-frameworks.html', 'mlops/llm-agents/agent-memory.html'] },
          { title: 'Agent Memory: Short-Term, Long-Term, Episodic', file: 'mlops/llm-agents/agent-memory.html', links: ['mlops/llm-agents/agent-fundamentals.html', 'mlops/llm-agents/agent-observability.html'] },
          { title: 'Agent Observability: Tracing and Debugging', file: 'mlops/llm-agents/agent-observability.html', links: ['mlops/llm-agents/agent-memory.html', 'mlops/llm-agents/agent-planning.html'] },
          { title: 'Agent Planning: ToT, GoT, and Beyond', file: 'mlops/llm-agents/agent-planning.html', links: ['mlops/llm-agents/agent-observability.html', 'mlops/llm-agents/agent-security.html'] },
          { title: 'Agent Security: Injection, Tool Abuse, Sandboxing', file: 'mlops/llm-agents/agent-security.html', links: ['mlops/llm-agents/agent-planning.html', 'mlops/llm-agents/code-execution-sandbox.html'] },
          { title: 'Code Sandboxes: E2B, Modal, Docker', file: 'mlops/llm-agents/code-execution-sandbox.html', links: ['mlops/llm-agents/agent-security.html', 'mlops/llm-agents/multi-agent-systems.html'] },
          { title: 'Multi-Agent Systems: Collaboration', file: 'mlops/llm-agents/multi-agent-systems.html', links: ['mlops/llm-agents/code-execution-sandbox.html', 'mlops/llm-agents/tool-use-patterns.html'] },
          { title: 'Tool Use: APIs, Code Execution, Retrieval', file: 'mlops/llm-agents/tool-use-patterns.html', links: ['mlops/llm-agents/multi-agent-systems.html', 'mlops/llm-agents/workflow-orchestration.html'] },
          { title: 'Workflow Orchestration: LangGraph, Temporal', file: 'mlops/llm-agents/workflow-orchestration.html', links: ['mlops/llm-agents/tool-use-patterns.html'] }
        ]
      },
      {
        name: 'sota-frontiers',
        label: 'SOTA & Frontiers',
        children: [
          { title: 'AI Safety: Mechanistic Interpretability, Alignment', file: 'mlops/sota-frontiers/ai-safety-research.html', links: ['mlops/sota-frontiers/continual-learning.html'] },
          { title: 'Continual Learning: Avoiding Catastrophic Forgetting', file: 'mlops/sota-frontiers/continual-learning.html', links: ['mlops/sota-frontiers/ai-safety-research.html', 'mlops/sota-frontiers/distillation-llm.html'] },
          { title: 'LLM Distillation: Small from Large', file: 'mlops/sota-frontiers/distillation-llm.html', links: ['mlops/sota-frontiers/continual-learning.html', 'mlops/sota-frontiers/efficient-attention.html'] },
          { title: 'Efficient Attention: Linear, Sparse, Multi-Head', file: 'mlops/sota-frontiers/efficient-attention.html', links: ['mlops/sota-frontiers/distillation-llm.html', 'mlops/sota-frontiers/hardware-frontiers.html'] },
          { title: 'Hardware: H100, B200, TPUv5, Groq, Cerebras', file: 'mlops/sota-frontiers/hardware-frontiers.html', links: ['mlops/sota-frontiers/efficient-attention.html', 'mlops/sota-frontiers/inference-innovations.html'] },
          { title: 'Inference Innovations: Medusa, Lookahead', file: 'mlops/sota-frontiers/inference-innovations.html', links: ['mlops/sota-frontiers/hardware-frontiers.html', 'mlops/sota-frontiers/long-context.html'] },
          { title: 'Long Context: RoPE Scaling, ALiBi, Ring Attention', file: 'mlops/sota-frontiers/long-context.html', links: ['mlops/sota-frontiers/inference-innovations.html', 'mlops/sota-frontiers/model-merging.html'] },
          { title: 'Model Merging: SLERP, TIES, DARE', file: 'mlops/sota-frontiers/model-merging.html', links: ['mlops/sota-frontiers/long-context.html', 'mlops/sota-frontiers/moe-architectures.html'] },
          { title: 'Mixture of Experts: Architecture and Ops', file: 'mlops/sota-frontiers/moe-architectures.html', links: ['mlops/sota-frontiers/model-merging.html', 'mlops/sota-frontiers/multimodal-models.html'] },
          { title: 'Multimodal Ops: GPT-4V, Gemini, Claude Vision', file: 'mlops/sota-frontiers/multimodal-models.html', links: ['mlops/sota-frontiers/moe-architectures.html', 'mlops/sota-frontiers/open-source-llm-landscape.html'] },
          { title: 'Open Source LLMs: Llama, Mistral, DeepSeek, Qwen', file: 'mlops/sota-frontiers/open-source-llm-landscape.html', links: ['mlops/sota-frontiers/multimodal-models.html', 'mlops/sota-frontiers/reasoning-models.html'] },
          { title: 'Reasoning Models: o1, DeepSeek-R1, Test-Time Compute', file: 'mlops/sota-frontiers/reasoning-models.html', links: ['mlops/sota-frontiers/open-source-llm-landscape.html', 'mlops/sota-frontiers/reinforcement-learning-new.html'] },
          { title: 'Beyond RLHF: RLAIF, KTO, ORPO, GRPO', file: 'mlops/sota-frontiers/reinforcement-learning-new.html', links: ['mlops/sota-frontiers/reasoning-models.html', 'mlops/sota-frontiers/scaling-laws-2.html'] },
          { title: 'Scaling Laws Revisited: Chinchilla, DeepSeek', file: 'mlops/sota-frontiers/scaling-laws-2.html', links: ['mlops/sota-frontiers/reinforcement-learning-new.html', 'mlops/sota-frontiers/small-language-models.html'] },
          { title: 'Small LMs: Phi, Gemma, On-Device', file: 'mlops/sota-frontiers/small-language-models.html', links: ['mlops/sota-frontiers/scaling-laws-2.html', 'mlops/sota-frontiers/sparse-models.html'] },
          { title: 'Sparse Models: Activation Sparsity, Conditional Compute', file: 'mlops/sota-frontiers/sparse-models.html', links: ['mlops/sota-frontiers/small-language-models.html', 'mlops/sota-frontiers/state-space-models.html'] },
          { title: 'State Space Models: Mamba, S4', file: 'mlops/sota-frontiers/state-space-models.html', links: ['mlops/sota-frontiers/sparse-models.html', 'mlops/sota-frontiers/synthetic-data-llm.html'] },
          { title: 'Synthetic Data: Self-Play, Distillation', file: 'mlops/sota-frontiers/synthetic-data-llm.html', links: ['mlops/sota-frontiers/state-space-models.html', 'mlops/sota-frontiers/training-recipes.html'] },
          { title: 'Training Recipes: Open Source Playbooks', file: 'mlops/sota-frontiers/training-recipes.html', links: ['mlops/sota-frontiers/synthetic-data-llm.html', 'mlops/sota-frontiers/whats-next.html'] },
          { title: 'What\'s Next in MLOps: Predictions and Trends', file: 'mlops/sota-frontiers/whats-next.html', links: ['mlops/sota-frontiers/training-recipes.html'] }
        ]
      }
    ]
  },
  {
    name: 'cp',
    label: 'CP Math',
    children: [
      {
        name: 'setup',
        label: 'CP Foundations',
        children: [
          { title: 'Introduction to Competitive Programming', file: 'cp/setup/competitive-programming-intro.html', links: ['cp/setup/io-optimization.html'] },
          { title: 'I/O Optimization for CP', file: 'cp/setup/io-optimization.html', links: ['cp/setup/competitive-programming-intro.html', 'cp/setup/template-setup.html'] },
          { title: 'C++ CP Template Setup', file: 'cp/setup/template-setup.html', links: ['cp/setup/io-optimization.html', 'cp/setup/stl-for-cp.html'] },
          { title: 'Advanced STL for CP', file: 'cp/setup/stl-for-cp.html', links: ['cp/setup/template-setup.html', 'cp/setup/debugging-stress-testing.html'] },
          { title: 'Debugging &amp; Stress Testing', file: 'cp/setup/debugging-stress-testing.html', links: ['cp/setup/stl-for-cp.html', 'cp/setup/mathematical-thinking.html'] },
          { title: 'Mathematical Thinking for CP', file: 'cp/setup/mathematical-thinking.html', links: ['cp/setup/debugging-stress-testing.html', 'cp/setup/contest-math-foundations.html'] },
          { title: 'Contest Math Foundations', file: 'cp/setup/contest-math-foundations.html', links: ['cp/setup/mathematical-thinking.html', 'cp/setup/modular-arithmetic-setup.html'] },
          { title: 'Modular Arithmetic Setup', file: 'cp/setup/modular-arithmetic-setup.html', links: ['cp/setup/contest-math-foundations.html'] }
        ]
      },
      {
        name: 'number-theory-1',
        label: 'Number Theory I',
        children: [
          { title: 'Divisibility &amp; Primes', file: 'cp/number-theory-1/divisibility-primes.html', links: ['cp/number-theory-1/sieve-eratosthenes.html'] },
          { title: 'Sieve of Eratosthenes &amp; Variants', file: 'cp/number-theory-1/sieve-eratosthenes.html', links: ['cp/number-theory-1/divisibility-primes.html', 'cp/number-theory-1/prime-factorization.html'] },
          { title: 'Prime Factorization Techniques', file: 'cp/number-theory-1/prime-factorization.html', links: ['cp/number-theory-1/sieve-eratosthenes.html', 'cp/number-theory-1/gcd-lcm.html'] },
          { title: 'GCD &amp; LCM Algorithms', file: 'cp/number-theory-1/gcd-lcm.html', links: ['cp/number-theory-1/prime-factorization.html', 'cp/number-theory-1/modular-arithmetic.html'] },
          { title: 'Modular Arithmetic &amp; Overflow Handling', file: 'cp/number-theory-1/modular-arithmetic.html', links: ['cp/number-theory-1/gcd-lcm.html', 'cp/number-theory-1/fast-exponentiation.html'] },
          { title: 'Fast Exponentiation — Binary Power &amp; Matrix Exponentiation', file: 'cp/number-theory-1/fast-exponentiation.html', links: ['cp/number-theory-1/modular-arithmetic.html', 'cp/number-theory-1/modular-inverse.html'] },
          { title: 'Modular Inverse — Fermat, ExtGCD &amp; Precomputation', file: 'cp/number-theory-1/modular-inverse.html', links: ['cp/number-theory-1/fast-exponentiation.html', 'cp/number-theory-1/fermats-little-theorem.html'] },
          { title: 'Fermat\'s Little Theorem', file: 'cp/number-theory-1/fermats-little-theorem.html', links: ['cp/number-theory-1/modular-inverse.html', 'cp/number-theory-1/euler-totient.html'] },
          { title: 'Euler\'s Totient Function', file: 'cp/number-theory-1/euler-totient.html', links: ['cp/number-theory-1/fermats-little-theorem.html', 'cp/number-theory-1/extended-euclidean.html'] },
          { title: 'Extended Euclidean Algorithm &amp; Bézout\'s Identity', file: 'cp/number-theory-1/extended-euclidean.html', links: ['cp/number-theory-1/euler-totient.html', 'cp/number-theory-1/linear-diophantine.html'] },
          { title: 'Linear Diophantine Equations', file: 'cp/number-theory-1/linear-diophantine.html', links: ['cp/number-theory-1/extended-euclidean.html', 'cp/number-theory-1/chinese-remainder-theorem.html'] },
          { title: 'Chinese Remainder Theorem', file: 'cp/number-theory-1/chinese-remainder-theorem.html', links: ['cp/number-theory-1/linear-diophantine.html', 'cp/number-theory-1/modular-equations.html'] },
          { title: 'Modular Equations — Solving ax ≡ b (mod m)', file: 'cp/number-theory-1/modular-equations.html', links: ['cp/number-theory-1/chinese-remainder-theorem.html', 'cp/number-theory-1/multiplicative-functions.html'] },
          { title: 'Multiplicative Functions — φ, σ, τ, μ &amp; Dirichlet Convolution', file: 'cp/number-theory-1/multiplicative-functions.html', links: ['cp/number-theory-1/modular-equations.html', 'cp/number-theory-1/sum-of-divisors.html'] },
          { title: 'Sum &amp; Count of Divisors — σ(n), τ(n), Perfect Numbers', file: 'cp/number-theory-1/sum-of-divisors.html', links: ['cp/number-theory-1/multiplicative-functions.html', 'cp/number-theory-1/mobius-function.html'] },
          { title: 'The Möbius Function — Inversion, Square-Free &amp; Coprime Counting', file: 'cp/number-theory-1/mobius-function.html', links: ['cp/number-theory-1/sum-of-divisors.html', 'cp/number-theory-1/order-primitive-roots.html'] },
          { title: 'Multiplicative Order &amp; Primitive Roots', file: 'cp/number-theory-1/order-primitive-roots.html', links: ['cp/number-theory-1/mobius-function.html', 'cp/number-theory-1/discrete-logarithm.html'] },
          { title: 'Discrete Logarithm: BSGS &amp; Pohlig-Hellman', file: 'cp/number-theory-1/discrete-logarithm.html', links: ['cp/number-theory-1/order-primitive-roots.html', 'cp/number-theory-1/quadratic-residues.html'] },
          { title: 'Quadratic Residues &amp; Tonelli-Shanks', file: 'cp/number-theory-1/quadratic-residues.html', links: ['cp/number-theory-1/discrete-logarithm.html', 'cp/number-theory-1/number-theory-patterns.html'] },
          { title: 'Number Theory Problem Patterns for CP', file: 'cp/number-theory-1/number-theory-patterns.html', links: ['cp/number-theory-1/quadratic-residues.html'] }
        ]
      },
      {
        name: 'number-theory-2',
        label: 'Number Theory II',
        children: [
          { title: 'Miller–Rabin Primality Test', file: 'cp/number-theory-2/miller-rabin.html', links: ['cp/number-theory-2/pollard-rho.html'] },
          { title: 'Pollard\'s Rho Factorization', file: 'cp/number-theory-2/pollard-rho.html', links: ['cp/number-theory-2/miller-rabin.html', 'cp/number-theory-2/lucas-theorem.html'] },
          { title: 'Lucas\' Theorem', file: 'cp/number-theory-2/lucas-theorem.html', links: ['cp/number-theory-2/pollard-rho.html', 'cp/number-theory-2/p-adic-valuation.html'] },
          { title: 'p-adic Valuation', file: 'cp/number-theory-2/p-adic-valuation.html', links: ['cp/number-theory-2/lucas-theorem.html', 'cp/number-theory-2/arithmetic-functions-sieve.html'] },
          { title: 'Arithmetic Functions &amp; Sieves', file: 'cp/number-theory-2/arithmetic-functions-sieve.html', links: ['cp/number-theory-2/p-adic-valuation.html', 'cp/number-theory-2/floor-ceiling-sums.html'] },
          { title: 'Floor &amp; Ceiling Sums', file: 'cp/number-theory-2/floor-ceiling-sums.html', links: ['cp/number-theory-2/arithmetic-functions-sieve.html', 'cp/number-theory-2/digit-sums.html'] },
          { title: 'Digit Sums &amp; Digital Root', file: 'cp/number-theory-2/digit-sums.html', links: ['cp/number-theory-2/floor-ceiling-sums.html', 'cp/number-theory-2/smooth-numbers.html'] },
          { title: 'Smooth Numbers', file: 'cp/number-theory-2/smooth-numbers.html', links: ['cp/number-theory-2/digit-sums.html', 'cp/number-theory-2/powerful-numbers.html'] },
          { title: 'Powerful Numbers', file: 'cp/number-theory-2/powerful-numbers.html', links: ['cp/number-theory-2/smooth-numbers.html', 'cp/number-theory-2/ntt-number-theory.html'] },
          { title: 'Number Theoretic Transform', file: 'cp/number-theory-2/ntt-number-theory.html', links: ['cp/number-theory-2/powerful-numbers.html', 'cp/number-theory-2/continued-fractions.html'] },
          { title: 'Continued Fractions', file: 'cp/number-theory-2/continued-fractions.html', links: ['cp/number-theory-2/ntt-number-theory.html', 'cp/number-theory-2/stern-brocot-tree.html'] },
          { title: 'Stern–Brocot Tree &amp; Farey Sequences', file: 'cp/number-theory-2/stern-brocot-tree.html', links: ['cp/number-theory-2/continued-fractions.html', 'cp/number-theory-2/pell-equation.html'] },
          { title: 'Pell\'s Equation', file: 'cp/number-theory-2/pell-equation.html', links: ['cp/number-theory-2/stern-brocot-tree.html', 'cp/number-theory-2/pythagorean-triples.html'] },
          { title: 'Pythagorean Triples', file: 'cp/number-theory-2/pythagorean-triples.html', links: ['cp/number-theory-2/pell-equation.html', 'cp/number-theory-2/min-25-sieve.html'] },
          { title: 'Min-25 Sieve', file: 'cp/number-theory-2/min-25-sieve.html', links: ['cp/number-theory-2/pythagorean-triples.html', 'cp/number-theory-2/advanced-nt-patterns.html'] },
          { title: 'Advanced Number Theory Patterns', file: 'cp/number-theory-2/advanced-nt-patterns.html', links: ['cp/number-theory-2/min-25-sieve.html'] }
        ]
      },
      {
        name: 'combinatorics-1',
        label: 'Combinatorics I',
        children: [
          { title: 'Counting Principles: Addition, Multiplication &amp; Bijection', file: 'cp/combinatorics-1/counting-principles.html', links: ['cp/combinatorics-1/permutations.html'] },
          { title: 'Permutations: Arrangements That Matter', file: 'cp/combinatorics-1/permutations.html', links: ['cp/combinatorics-1/counting-principles.html', 'cp/combinatorics-1/combinations.html'] },
          { title: 'Combinations &amp; Pascal\'s Triangle', file: 'cp/combinatorics-1/combinations.html', links: ['cp/combinatorics-1/permutations.html', 'cp/combinatorics-1/binomial-coefficients.html'] },
          { title: 'Binomial Coefficients: Precomputation &amp; Modular Arithmetic', file: 'cp/combinatorics-1/binomial-coefficients.html', links: ['cp/combinatorics-1/combinations.html', 'cp/combinatorics-1/stars-and-bars.html'] },
          { title: 'Stars and Bars: Distributing Identical Objects', file: 'cp/combinatorics-1/stars-and-bars.html', links: ['cp/combinatorics-1/binomial-coefficients.html', 'cp/combinatorics-1/multinomial.html'] },
          { title: 'Multinomial Coefficients &amp; the Multinomial Theorem', file: 'cp/combinatorics-1/multinomial.html', links: ['cp/combinatorics-1/stars-and-bars.html', 'cp/combinatorics-1/inclusion-exclusion.html'] },
          { title: 'Inclusion-Exclusion Principle', file: 'cp/combinatorics-1/inclusion-exclusion.html', links: ['cp/combinatorics-1/multinomial.html', 'cp/combinatorics-1/pigeonhole.html'] },
          { title: 'The Pigeonhole Principle', file: 'cp/combinatorics-1/pigeonhole.html', links: ['cp/combinatorics-1/inclusion-exclusion.html', 'cp/combinatorics-1/double-counting.html'] },
          { title: 'Double Counting &amp; Combinatorial Proofs', file: 'cp/combinatorics-1/double-counting.html', links: ['cp/combinatorics-1/pigeonhole.html', 'cp/combinatorics-1/recurrence-relations.html'] },
          { title: 'Recurrence Relations &amp; Characteristic Equations', file: 'cp/combinatorics-1/recurrence-relations.html', links: ['cp/combinatorics-1/double-counting.html', 'cp/combinatorics-1/generating-functions-intro.html'] },
          { title: 'Generating Functions: OGF Basics', file: 'cp/combinatorics-1/generating-functions-intro.html', links: ['cp/combinatorics-1/recurrence-relations.html', 'cp/combinatorics-1/generating-functions-advanced.html'] },
          { title: 'Advanced Generating Functions: Composition &amp; Partial Fractions', file: 'cp/combinatorics-1/generating-functions-advanced.html', links: ['cp/combinatorics-1/generating-functions-intro.html', 'cp/combinatorics-1/exponential-gf.html'] },
          { title: 'Exponential Generating Functions &amp; Labeled Structures', file: 'cp/combinatorics-1/exponential-gf.html', links: ['cp/combinatorics-1/generating-functions-advanced.html', 'cp/combinatorics-1/catalan-numbers.html'] },
          { title: 'Catalan Numbers: The Universal Counting Sequence', file: 'cp/combinatorics-1/catalan-numbers.html', links: ['cp/combinatorics-1/exponential-gf.html', 'cp/combinatorics-1/fibonacci-lucas.html'] },
          { title: 'Fibonacci &amp; Lucas Numbers in Competitive Programming', file: 'cp/combinatorics-1/fibonacci-lucas.html', links: ['cp/combinatorics-1/catalan-numbers.html', 'cp/combinatorics-1/stirling-numbers.html'] },
          { title: 'Stirling Numbers: First &amp; Second Kind', file: 'cp/combinatorics-1/stirling-numbers.html', links: ['cp/combinatorics-1/fibonacci-lucas.html', 'cp/combinatorics-1/bell-numbers.html'] },
          { title: 'Bell Numbers &amp; Set Partitions', file: 'cp/combinatorics-1/bell-numbers.html', links: ['cp/combinatorics-1/stirling-numbers.html', 'cp/combinatorics-1/partition-function.html'] },
          { title: 'Integer Partitions &amp; the Partition Function', file: 'cp/combinatorics-1/partition-function.html', links: ['cp/combinatorics-1/bell-numbers.html', 'cp/combinatorics-1/derangements.html'] },
          { title: 'Derangements: When Nothing Stays in Place', file: 'cp/combinatorics-1/derangements.html', links: ['cp/combinatorics-1/partition-function.html', 'cp/combinatorics-1/lattice-paths.html'] },
          { title: 'Lattice Paths, Dyck Paths &amp; the Ballot Problem', file: 'cp/combinatorics-1/lattice-paths.html', links: ['cp/combinatorics-1/derangements.html', 'cp/combinatorics-1/twelvefold-way.html'] },
          { title: 'The Twelvefold Way: A Systematic Framework', file: 'cp/combinatorics-1/twelvefold-way.html', links: ['cp/combinatorics-1/lattice-paths.html', 'cp/combinatorics-1/counting-patterns.html'] },
          { title: 'Counting Patterns: Problems from CF, ICPC &amp; Beyond', file: 'cp/combinatorics-1/counting-patterns.html', links: ['cp/combinatorics-1/twelvefold-way.html'] }
        ]
      },
      {
        name: 'combinatorics-2',
        label: 'Combinatorics II',
        children: [
          { title: 'Group Theory Basics', file: 'cp/combinatorics-2/group-theory-basics.html', links: ['cp/combinatorics-2/burnside-lemma.html'] },
          { title: 'Burnside\'s Lemma — Orbit Counting &amp; Symmetry Groups', file: 'cp/combinatorics-2/burnside-lemma.html', links: ['cp/combinatorics-2/group-theory-basics.html', 'cp/combinatorics-2/polya-enumeration.html'] },
          { title: 'P&oacute;lya Enumeration Theorem', file: 'cp/combinatorics-2/polya-enumeration.html', links: ['cp/combinatorics-2/burnside-lemma.html', 'cp/combinatorics-2/young-tableaux.html'] },
          { title: 'Young Tableaux — RSK Correspondence &amp; Hook Length Formula', file: 'cp/combinatorics-2/young-tableaux.html', links: ['cp/combinatorics-2/polya-enumeration.html', 'cp/combinatorics-2/symbolic-method.html'] },
          { title: 'Symbolic Method — Analytic Combinatorics Basics', file: 'cp/combinatorics-2/symbolic-method.html', links: ['cp/combinatorics-2/young-tableaux.html', 'cp/combinatorics-2/species-theory.html'] },
          { title: 'Combinatorial Species — Species Theory Overview', file: 'cp/combinatorics-2/species-theory.html', links: ['cp/combinatorics-2/symbolic-method.html', 'cp/combinatorics-2/transfer-matrix.html'] },
          { title: 'Transfer Matrix Method — Counting Paths via Matrix Exponentiation', file: 'cp/combinatorics-2/transfer-matrix.html', links: ['cp/combinatorics-2/species-theory.html', 'cp/combinatorics-2/permanent-matrix.html'] },
          { title: 'Permanent of a Matrix', file: 'cp/combinatorics-2/permanent-matrix.html', links: ['cp/combinatorics-2/transfer-matrix.html', 'cp/combinatorics-2/lindstrom-gessel-viennot.html'] },
          { title: 'Lindström–Gessel–Viennot Lemma — Non-Intersecting Lattice Paths', file: 'cp/combinatorics-2/lindstrom-gessel-viennot.html', links: ['cp/combinatorics-2/permanent-matrix.html', 'cp/combinatorics-2/chromatic-polynomial.html'] },
          { title: 'Chromatic Polynomial — Graph Coloring Polynomial', file: 'cp/combinatorics-2/chromatic-polynomial.html', links: ['cp/combinatorics-2/lindstrom-gessel-viennot.html', 'cp/combinatorics-2/mobius-inversion-posets.html'] },
          { title: 'Möbius Inversion on Posets — Zeta &amp; Möbius Transforms', file: 'cp/combinatorics-2/mobius-inversion-posets.html', links: ['cp/combinatorics-2/chromatic-polynomial.html', 'cp/combinatorics-2/hypergeometric-identities.html'] },
          { title: 'Hypergeometric Identities — WZ Method &amp; Vandermonde Convolution', file: 'cp/combinatorics-2/hypergeometric-identities.html', links: ['cp/combinatorics-2/mobius-inversion-posets.html', 'cp/combinatorics-2/ramsey-theory.html'] },
          { title: 'Ramsey Theory — R(3,3) &amp; Applications in Competitive Programming', file: 'cp/combinatorics-2/ramsey-theory.html', links: ['cp/combinatorics-2/hypergeometric-identities.html', 'cp/combinatorics-2/extremal-combinatorics.html'] },
          { title: 'Extremal Combinatorics — Dilworth, Erdős-Ko-Rado &amp; Sperner', file: 'cp/combinatorics-2/extremal-combinatorics.html', links: ['cp/combinatorics-2/ramsey-theory.html', 'cp/combinatorics-2/matroid-theory.html'] },
          { title: 'Matroid Theory — Matroid Intersection &amp; Greedy on Matroids', file: 'cp/combinatorics-2/matroid-theory.html', links: ['cp/combinatorics-2/extremal-combinatorics.html', 'cp/combinatorics-2/advanced-counting-patterns.html'] },
          { title: 'Advanced Counting Patterns', file: 'cp/combinatorics-2/advanced-counting-patterns.html', links: ['cp/combinatorics-2/matroid-theory.html'] }
        ]
      },
      {
        name: 'probability',
        label: 'Probability',
        children: [
          { title: 'Probability Basics for Competitive Programming', file: 'cp/probability/probability-basics.html', links: ['cp/probability/expected-value.html'] },
          { title: 'Expected Value &amp; Linearity of Expectation', file: 'cp/probability/expected-value.html', links: ['cp/probability/probability-basics.html', 'cp/probability/indicator-random-variables.html'] },
          { title: 'Indicator Random Variables', file: 'cp/probability/indicator-random-variables.html', links: ['cp/probability/expected-value.html', 'cp/probability/geometric-distribution.html'] },
          { title: 'Geometric Distribution &amp; Coupon Collector', file: 'cp/probability/geometric-distribution.html', links: ['cp/probability/indicator-random-variables.html', 'cp/probability/variance-concentration.html'] },
          { title: 'Variance &amp; Concentration Inequalities', file: 'cp/probability/variance-concentration.html', links: ['cp/probability/geometric-distribution.html', 'cp/probability/bayes-theorem.html'] },
          { title: 'Bayes\' Theorem &amp; Total Probability', file: 'cp/probability/bayes-theorem.html', links: ['cp/probability/variance-concentration.html', 'cp/probability/probability-dp.html'] },
          { title: 'DP on Probability Distributions', file: 'cp/probability/probability-dp.html', links: ['cp/probability/bayes-theorem.html', 'cp/probability/expected-value-dp.html'] },
          { title: 'Expected Value via DP', file: 'cp/probability/expected-value-dp.html', links: ['cp/probability/probability-dp.html', 'cp/probability/probability-mod-arithmetic.html'] },
          { title: 'Probability with Modular Arithmetic', file: 'cp/probability/probability-mod-arithmetic.html', links: ['cp/probability/expected-value-dp.html', 'cp/probability/markov-chains.html'] },
          { title: 'Markov Chains for Competitive Programming', file: 'cp/probability/markov-chains.html', links: ['cp/probability/probability-mod-arithmetic.html', 'cp/probability/random-walks.html'] },
          { title: 'Random Walks &amp; Gambler\'s Ruin', file: 'cp/probability/random-walks.html', links: ['cp/probability/markov-chains.html', 'cp/probability/martingales-cp.html'] },
          { title: 'Martingales in Competitive Programming', file: 'cp/probability/martingales-cp.html', links: ['cp/probability/random-walks.html', 'cp/probability/probability-on-trees.html'] },
          { title: 'Probability on Trees', file: 'cp/probability/probability-on-trees.html', links: ['cp/probability/martingales-cp.html', 'cp/probability/randomized-algorithms.html'] },
          { title: 'Randomized Algorithms in CP', file: 'cp/probability/randomized-algorithms.html', links: ['cp/probability/probability-on-trees.html', 'cp/probability/random-hashing.html'] },
          { title: 'Random Hashing &amp; Birthday Paradox', file: 'cp/probability/random-hashing.html', links: ['cp/probability/randomized-algorithms.html', 'cp/probability/reservoir-sampling.html'] },
          { title: 'Reservoir Sampling', file: 'cp/probability/reservoir-sampling.html', links: ['cp/probability/random-hashing.html', 'cp/probability/stochastic-games.html'] },
          { title: 'Stochastic Games &amp; Expected Value', file: 'cp/probability/stochastic-games.html', links: ['cp/probability/reservoir-sampling.html', 'cp/probability/probability-patterns.html'] },
          { title: 'Probability Patterns from CF &amp; ICPC', file: 'cp/probability/probability-patterns.html', links: ['cp/probability/stochastic-games.html'] }
        ]
      },
      {
        name: 'algebra',
        label: 'Algebra & Polynomials',
        children: [
          { title: 'Polynomial Basics', file: 'cp/algebra/polynomial-basics.html', links: ['cp/algebra/polynomial-multiplication.html'] },
          { title: 'Polynomial Multiplication', file: 'cp/algebra/polynomial-multiplication.html', links: ['cp/algebra/polynomial-basics.html', 'cp/algebra/polynomial-division.html'] },
          { title: 'Polynomial Division', file: 'cp/algebra/polynomial-division.html', links: ['cp/algebra/polynomial-multiplication.html', 'cp/algebra/polynomial-gcd.html'] },
          { title: 'Polynomial GCD &amp; Half-GCD', file: 'cp/algebra/polynomial-gcd.html', links: ['cp/algebra/polynomial-division.html', 'cp/algebra/lagrange-interpolation.html'] },
          { title: 'Lagrange Interpolation', file: 'cp/algebra/lagrange-interpolation.html', links: ['cp/algebra/polynomial-gcd.html', 'cp/algebra/vietas-formulas.html'] },
          { title: 'Vieta\'s Formulas', file: 'cp/algebra/vietas-formulas.html', links: ['cp/algebra/lagrange-interpolation.html', 'cp/algebra/newtons-identities.html'] },
          { title: 'Newton\'s Identities', file: 'cp/algebra/newtons-identities.html', links: ['cp/algebra/vietas-formulas.html', 'cp/algebra/fft.html'] },
          { title: 'Fast Fourier Transform', file: 'cp/algebra/fft.html', links: ['cp/algebra/newtons-identities.html', 'cp/algebra/fft-implementation.html'] },
          { title: 'FFT Implementation', file: 'cp/algebra/fft-implementation.html', links: ['cp/algebra/fft.html', 'cp/algebra/fft-applications.html'] },
          { title: 'FFT Applications', file: 'cp/algebra/fft-applications.html', links: ['cp/algebra/fft-implementation.html', 'cp/algebra/ntt.html'] },
          { title: 'Number Theoretic Transform', file: 'cp/algebra/ntt.html', links: ['cp/algebra/fft-applications.html', 'cp/algebra/convolution-variants.html'] },
          { title: 'Convolution Variants', file: 'cp/algebra/convolution-variants.html', links: ['cp/algebra/ntt.html', 'cp/algebra/formal-power-series.html'] },
          { title: 'Formal Power Series', file: 'cp/algebra/formal-power-series.html', links: ['cp/algebra/convolution-variants.html', 'cp/algebra/fps-operations.html'] },
          { title: 'FPS Composition &amp; Inverse', file: 'cp/algebra/fps-operations.html', links: ['cp/algebra/formal-power-series.html', 'cp/algebra/polynomial-hashing.html'] },
          { title: 'Polynomial Hashing', file: 'cp/algebra/polynomial-hashing.html', links: ['cp/algebra/fps-operations.html', 'cp/algebra/matrix-exponentiation.html'] },
          { title: 'Matrix Exponentiation', file: 'cp/algebra/matrix-exponentiation.html', links: ['cp/algebra/polynomial-hashing.html', 'cp/algebra/characteristic-polynomial.html'] },
          { title: 'Characteristic Polynomial', file: 'cp/algebra/characteristic-polynomial.html', links: ['cp/algebra/matrix-exponentiation.html', 'cp/algebra/berlekamp-massey.html'] },
          { title: 'Berlekamp–Massey Algorithm', file: 'cp/algebra/berlekamp-massey.html', links: ['cp/algebra/characteristic-polynomial.html', 'cp/algebra/kitamasa-method.html'] },
          { title: 'Kitamasa\'s Method', file: 'cp/algebra/kitamasa-method.html', links: ['cp/algebra/berlekamp-massey.html', 'cp/algebra/multipoint-evaluation.html'] },
          { title: 'Multipoint Evaluation', file: 'cp/algebra/multipoint-evaluation.html', links: ['cp/algebra/kitamasa-method.html', 'cp/algebra/resultant.html'] },
          { title: 'Polynomial Resultant', file: 'cp/algebra/resultant.html', links: ['cp/algebra/multipoint-evaluation.html', 'cp/algebra/algebra-patterns.html'] },
          { title: 'Algebra Problem Patterns', file: 'cp/algebra/algebra-patterns.html', links: ['cp/algebra/resultant.html'] }
        ]
      },
      {
        name: 'linear-algebra',
        label: 'Linear Algebra',
        children: [
          { title: 'Vectors &amp; Matrices — Basics &amp; Representation in C++', file: 'cp/linear-algebra/vectors-matrices.html', links: ['cp/linear-algebra/matrix-multiplication.html'] },
          { title: 'Matrix Multiplication', file: 'cp/linear-algebra/matrix-multiplication.html', links: ['cp/linear-algebra/vectors-matrices.html', 'cp/linear-algebra/gaussian-elimination.html'] },
          { title: 'Gaussian Elimination — Row Reduction, RREF &amp; Pivoting', file: 'cp/linear-algebra/gaussian-elimination.html', links: ['cp/linear-algebra/matrix-multiplication.html', 'cp/linear-algebra/systems-of-equations.html'] },
          { title: 'Systems of Linear Equations', file: 'cp/linear-algebra/systems-of-equations.html', links: ['cp/linear-algebra/gaussian-elimination.html', 'cp/linear-algebra/matrix-rank.html'] },
          { title: 'Matrix Rank — Rank Computation &amp; Dimension Counting', file: 'cp/linear-algebra/matrix-rank.html', links: ['cp/linear-algebra/systems-of-equations.html', 'cp/linear-algebra/determinant.html'] },
          { title: 'Determinants', file: 'cp/linear-algebra/determinant.html', links: ['cp/linear-algebra/matrix-rank.html', 'cp/linear-algebra/matrix-inverse.html'] },
          { title: 'Matrix Inverse', file: 'cp/linear-algebra/matrix-inverse.html', links: ['cp/linear-algebra/determinant.html', 'cp/linear-algebra/lu-decomposition.html'] },
          { title: 'LU Decomposition', file: 'cp/linear-algebra/lu-decomposition.html', links: ['cp/linear-algebra/matrix-inverse.html', 'cp/linear-algebra/matrix-exponentiation-la.html'] },
          { title: 'Matrix Exponentiation — O(n³ log k)', file: 'cp/linear-algebra/matrix-exponentiation-la.html', links: ['cp/linear-algebra/lu-decomposition.html', 'cp/linear-algebra/binary-matrices.html'] },
          { title: 'Binary Matrices — GF(2) Operations &amp; Light-Switching Puzzles', file: 'cp/linear-algebra/binary-matrices.html', links: ['cp/linear-algebra/matrix-exponentiation-la.html', 'cp/linear-algebra/kirchhoff-theorem.html'] },
          { title: 'Kirchhoff\'s Theorem — Spanning Tree Counting', file: 'cp/linear-algebra/kirchhoff-theorem.html', links: ['cp/linear-algebra/binary-matrices.html', 'cp/linear-algebra/simplex-method.html'] },
          { title: 'Simplex Method — Linear Programming for CP', file: 'cp/linear-algebra/simplex-method.html', links: ['cp/linear-algebra/kirchhoff-theorem.html', 'cp/linear-algebra/sweep-line-linalg.html'] },
          { title: 'Sweep Line &amp; Linear Algebra', file: 'cp/linear-algebra/sweep-line-linalg.html', links: ['cp/linear-algebra/simplex-method.html', 'cp/linear-algebra/matrix-games.html'] },
          { title: 'Matrix Games', file: 'cp/linear-algebra/matrix-games.html', links: ['cp/linear-algebra/sweep-line-linalg.html', 'cp/linear-algebra/linear-algebra-patterns.html'] },
          { title: 'Linear Algebra Patterns in CP', file: 'cp/linear-algebra/linear-algebra-patterns.html', links: ['cp/linear-algebra/matrix-games.html'] }
        ]
      },
      {
        name: 'game-theory',
        label: 'Game Theory',
        children: [
          { title: 'Combinatorial Games', file: 'cp/game-theory/combinatorial-games.html', links: ['cp/game-theory/nim-game.html'] },
          { title: 'The Nim Game', file: 'cp/game-theory/nim-game.html', links: ['cp/game-theory/combinatorial-games.html', 'cp/game-theory/sprague-grundy.html'] },
          { title: 'Sprague-Grundy Theorem', file: 'cp/game-theory/sprague-grundy.html', links: ['cp/game-theory/nim-game.html', 'cp/game-theory/nim-variants.html'] },
          { title: 'Nim Variants — Staircase Nim, Wythoff\'s Game, Fibonacci Nim &amp; More', file: 'cp/game-theory/nim-variants.html', links: ['cp/game-theory/sprague-grundy.html', 'cp/game-theory/subtraction-games.html'] },
          { title: 'Subtraction Games', file: 'cp/game-theory/subtraction-games.html', links: ['cp/game-theory/nim-variants.html', 'cp/game-theory/turning-turtles.html'] },
          { title: 'Turning Turtles — Mock Turtles &amp; Coin-Turning Games', file: 'cp/game-theory/turning-turtles.html', links: ['cp/game-theory/subtraction-games.html', 'cp/game-theory/green-hackenbush.html'] },
          { title: 'Green Hackenbush — Nim Equivalence on Graphs', file: 'cp/game-theory/green-hackenbush.html', links: ['cp/game-theory/turning-turtles.html', 'cp/game-theory/misere-games.html'] },
          { title: 'Misère Games — Misère Nim &amp; Sprague-Grundy Under Misère Play', file: 'cp/game-theory/misere-games.html', links: ['cp/game-theory/green-hackenbush.html', 'cp/game-theory/games-on-graphs.html'] },
          { title: 'Games on Graphs', file: 'cp/game-theory/games-on-graphs.html', links: ['cp/game-theory/misere-games.html', 'cp/game-theory/games-on-trees.html'] },
          { title: 'Games on Trees', file: 'cp/game-theory/games-on-trees.html', links: ['cp/game-theory/games-on-graphs.html', 'cp/game-theory/game-dp.html'] },
          { title: 'DP Approaches to Game Problems', file: 'cp/game-theory/game-dp.html', links: ['cp/game-theory/games-on-trees.html', 'cp/game-theory/partizan-games.html'] },
          { title: 'Partizan Games', file: 'cp/game-theory/partizan-games.html', links: ['cp/game-theory/game-dp.html', 'cp/game-theory/multi-player-games.html'] },
          { title: 'Multi-Player Games — Coalitions, Non-Zero-Sum &amp; Beyond Two Players', file: 'cp/game-theory/multi-player-games.html', links: ['cp/game-theory/partizan-games.html', 'cp/game-theory/strategy-stealing.html'] },
          { title: 'Strategy Stealing Argument — First-Player Wins', file: 'cp/game-theory/strategy-stealing.html', links: ['cp/game-theory/multi-player-games.html', 'cp/game-theory/retrograde-analysis.html'] },
          { title: 'Retrograde Analysis', file: 'cp/game-theory/retrograde-analysis.html', links: ['cp/game-theory/strategy-stealing.html', 'cp/game-theory/game-theory-patterns.html'] },
          { title: 'Game Theory Patterns from CF/ICPC — Problem Classification &amp; Strategies', file: 'cp/game-theory/game-theory-patterns.html', links: ['cp/game-theory/retrograde-analysis.html'] }
        ]
      },
      {
        name: 'geometry',
        label: 'Computational Geometry',
        children: [
          { title: 'Points &amp; Vectors: The Foundation', file: 'cp/geometry/points-vectors.html', links: ['cp/geometry/cross-product.html'] },
          { title: 'The Cross Product: Orientation and Area', file: 'cp/geometry/cross-product.html', links: ['cp/geometry/points-vectors.html', 'cp/geometry/lines-segments.html'] },
          { title: 'Lines &amp; Segments: Representation and Intersection', file: 'cp/geometry/lines-segments.html', links: ['cp/geometry/cross-product.html', 'cp/geometry/line-intersection.html'] },
          { title: 'Line Intersection: All Cases Covered', file: 'cp/geometry/line-intersection.html', links: ['cp/geometry/lines-segments.html', 'cp/geometry/polygon-area.html'] },
          { title: 'Polygon Area: The Shoelace Formula', file: 'cp/geometry/polygon-area.html', links: ['cp/geometry/line-intersection.html', 'cp/geometry/picks-theorem.html'] },
          { title: 'Pick\'s Theorem: Counting Lattice Points', file: 'cp/geometry/picks-theorem.html', links: ['cp/geometry/polygon-area.html', 'cp/geometry/point-in-polygon.html'] },
          { title: 'Point in Polygon: Ray Casting &amp; Winding Number', file: 'cp/geometry/point-in-polygon.html', links: ['cp/geometry/picks-theorem.html', 'cp/geometry/convex-hull.html'] },
          { title: 'Convex Hull: Graham Scan &amp; Monotone Chain', file: 'cp/geometry/convex-hull.html', links: ['cp/geometry/point-in-polygon.html', 'cp/geometry/point-in-convex.html'] },
          { title: 'Point in Convex Polygon: Binary Search Approach', file: 'cp/geometry/point-in-convex.html', links: ['cp/geometry/convex-hull.html', 'cp/geometry/rotating-calipers.html'] },
          { title: 'Rotating Calipers: Diameter and Beyond', file: 'cp/geometry/rotating-calipers.html', links: ['cp/geometry/point-in-convex.html', 'cp/geometry/closest-pair.html'] },
          { title: 'Closest Pair of Points', file: 'cp/geometry/closest-pair.html', links: ['cp/geometry/rotating-calipers.html', 'cp/geometry/sweep-line-geometry.html'] },
          { title: 'Sweep Line in Geometry', file: 'cp/geometry/sweep-line-geometry.html', links: ['cp/geometry/closest-pair.html', 'cp/geometry/half-plane-intersection.html'] },
          { title: 'Half-Plane Intersection', file: 'cp/geometry/half-plane-intersection.html', links: ['cp/geometry/sweep-line-geometry.html', 'cp/geometry/circle-operations.html'] },
          { title: 'Circle Operations: Intersections and Tangents', file: 'cp/geometry/circle-operations.html', links: ['cp/geometry/half-plane-intersection.html', 'cp/geometry/circle-union-area.html'] },
          { title: 'Area of Union of Circles', file: 'cp/geometry/circle-union-area.html', links: ['cp/geometry/circle-operations.html', 'cp/geometry/geometric-transforms.html'] },
          { title: 'Geometric Transformations', file: 'cp/geometry/geometric-transforms.html', links: ['cp/geometry/circle-union-area.html', 'cp/geometry/convex-hull-tricks-geo.html'] },
          { title: 'Convex Hull Tricks in Geometry', file: 'cp/geometry/convex-hull-tricks-geo.html', links: ['cp/geometry/geometric-transforms.html', 'cp/geometry/minkowski-sum.html'] },
          { title: 'Minkowski Sum of Polygons', file: 'cp/geometry/minkowski-sum.html', links: ['cp/geometry/convex-hull-tricks-geo.html', 'cp/geometry/precision-handling.html'] },
          { title: 'Precision Handling in Geometry', file: 'cp/geometry/precision-handling.html', links: ['cp/geometry/minkowski-sum.html', 'cp/geometry/geometry-integers.html'] },
          { title: 'Integer Geometry: Avoiding Floats', file: 'cp/geometry/geometry-integers.html', links: ['cp/geometry/precision-handling.html', 'cp/geometry/3d-geometry.html'] },
          { title: '3D Geometry Basics', file: 'cp/geometry/3d-geometry.html', links: ['cp/geometry/geometry-integers.html', 'cp/geometry/convex-hull-3d.html'] },
          { title: '3D Convex Hull', file: 'cp/geometry/convex-hull-3d.html', links: ['cp/geometry/3d-geometry.html', 'cp/geometry/delaunay-triangulation.html'] },
          { title: 'Delaunay Triangulation', file: 'cp/geometry/delaunay-triangulation.html', links: ['cp/geometry/convex-hull-3d.html', 'cp/geometry/voronoi-diagram.html'] },
          { title: 'Voronoi Diagrams', file: 'cp/geometry/voronoi-diagram.html', links: ['cp/geometry/delaunay-triangulation.html', 'cp/geometry/geometry-patterns.html'] },
          { title: 'Geometry Problem Patterns in Competitive Programming', file: 'cp/geometry/geometry-patterns.html', links: ['cp/geometry/voronoi-diagram.html'] }
        ]
      },
      {
        name: 'constructive',
        label: 'Constructive & Interactive',
        children: [
          { title: 'Constructive Algorithms &mdash; Parity, Invariants &amp; Greedy Construction', file: 'cp/constructive/constructive-algorithms.html', links: ['cp/constructive/invariant-monovariant.html'] },
          { title: 'Invariants &amp; Monovariants', file: 'cp/constructive/invariant-monovariant.html', links: ['cp/constructive/constructive-algorithms.html', 'cp/constructive/parity-arguments.html'] },
          { title: 'Parity Arguments', file: 'cp/constructive/parity-arguments.html', links: ['cp/constructive/invariant-monovariant.html', 'cp/constructive/sequence-construction.html'] },
          { title: 'Sequence Construction', file: 'cp/constructive/sequence-construction.html', links: ['cp/constructive/parity-arguments.html', 'cp/constructive/graph-construction.html'] },
          { title: 'Graph Construction', file: 'cp/constructive/graph-construction.html', links: ['cp/constructive/sequence-construction.html', 'cp/constructive/matrix-construction.html'] },
          { title: 'Matrix Construction', file: 'cp/constructive/matrix-construction.html', links: ['cp/constructive/graph-construction.html', 'cp/constructive/interactive-problems.html'] },
          { title: 'Interactive Problems', file: 'cp/constructive/interactive-problems.html', links: ['cp/constructive/matrix-construction.html', 'cp/constructive/interactive-binary-search.html'] },
          { title: 'Interactive Binary Search &mdash; Guessing Game, Comparator Oracle &amp; Searching with Lies', file: 'cp/constructive/interactive-binary-search.html', links: ['cp/constructive/interactive-problems.html', 'cp/constructive/interactive-sorting.html'] },
          { title: 'Interactive Sorting — Minimum Comparisons &amp; Information-Theoretic Bounds', file: 'cp/constructive/interactive-sorting.html', links: ['cp/constructive/interactive-binary-search.html', 'cp/constructive/interactive-graph.html'] },
          { title: 'Interactive Graph Problems — Exploring Hidden Structures with Queries', file: 'cp/constructive/interactive-graph.html', links: ['cp/constructive/interactive-sorting.html', 'cp/constructive/adaptive-adversary.html'] },
          { title: 'Adaptive Adversary Arguments &mdash; Lower Bounds &amp; Worst-Case Analysis', file: 'cp/constructive/adaptive-adversary.html', links: ['cp/constructive/interactive-graph.html', 'cp/constructive/communication-complexity.html'] },
          { title: 'Communication Complexity &mdash; Lower Bounds &amp; Interactive Query Strategies', file: 'cp/constructive/communication-complexity.html', links: ['cp/constructive/adaptive-adversary.html', 'cp/constructive/output-sensitive.html'] },
          { title: 'Output-Sensitive Algorithms — Enumeration &amp; Output-Dependent Complexity', file: 'cp/constructive/output-sensitive.html', links: ['cp/constructive/communication-complexity.html', 'cp/constructive/constructive-patterns.html'] },
          { title: 'Constructive &amp; Interactive Problem Patterns', file: 'cp/constructive/constructive-patterns.html', links: ['cp/constructive/output-sensitive.html'] }
        ]
      },
      {
        name: 'optimization',
        label: 'Optimization',
        children: [
          { title: 'Ternary Search', file: 'cp/optimization/ternary-search.html', links: ['cp/optimization/golden-section.html'] },
          { title: 'Golden Section Search &amp; Fibonacci Search', file: 'cp/optimization/golden-section.html', links: ['cp/optimization/ternary-search.html', 'cp/optimization/hill-climbing.html'] },
          { title: 'Hill Climbing — Random Restart &amp; Plateau Handling', file: 'cp/optimization/hill-climbing.html', links: ['cp/optimization/golden-section.html', 'cp/optimization/simulated-annealing.html'] },
          { title: 'Simulated Annealing for Competitive Programming', file: 'cp/optimization/simulated-annealing.html', links: ['cp/optimization/hill-climbing.html', 'cp/optimization/beam-search.html'] },
          { title: 'Beam Search for Optimization', file: 'cp/optimization/beam-search.html', links: ['cp/optimization/simulated-annealing.html', 'cp/optimization/meet-in-middle.html'] },
          { title: 'Meet in the Middle — Split-and-Merge &amp; Subset Sum', file: 'cp/optimization/meet-in-middle.html', links: ['cp/optimization/beam-search.html', 'cp/optimization/lagrangian-relaxation.html'] },
          { title: 'Lagrangian Relaxation', file: 'cp/optimization/lagrangian-relaxation.html', links: ['cp/optimization/meet-in-middle.html', 'cp/optimization/lp-duality.html'] },
          { title: 'LP Duality &amp; Complementary Slackness', file: 'cp/optimization/lp-duality.html', links: ['cp/optimization/lagrangian-relaxation.html', 'cp/optimization/ilp-branch-bound.html'] },
          { title: 'Integer LP &amp; Branch and Bound', file: 'cp/optimization/ilp-branch-bound.html', links: ['cp/optimization/lp-duality.html', 'cp/optimization/hungarian-detailed.html'] },
          { title: 'Hungarian Algorithm Walkthrough', file: 'cp/optimization/hungarian-detailed.html', links: ['cp/optimization/ilp-branch-bound.html', 'cp/optimization/min-cost-arborescence.html'] },
          { title: 'Edmond\'s Algorithm — Min-Cost Arborescence', file: 'cp/optimization/min-cost-arborescence.html', links: ['cp/optimization/hungarian-detailed.html', 'cp/optimization/submodular-optimization.html'] },
          { title: 'Submodular Functions — Greedy Guarantees &amp; Optimization', file: 'cp/optimization/submodular-optimization.html', links: ['cp/optimization/min-cost-arborescence.html', 'cp/optimization/matroid-intersection.html'] },
          { title: 'Matroid Intersection Algorithm', file: 'cp/optimization/matroid-intersection.html', links: ['cp/optimization/submodular-optimization.html', 'cp/optimization/optimization-patterns.html'] },
          { title: 'Optimization Patterns from CF/ICPC', file: 'cp/optimization/optimization-patterns.html', links: ['cp/optimization/matroid-intersection.html'] }
        ]
      },
      {
        name: 'contest-strategy',
        label: 'Contest Strategy',
        children: [
          { title: 'Practice Methodology — Deliberate Practice, Topic Rotation &amp; Spaced Repetition', file: 'cp/contest-strategy/practice-methodology.html', links: ['cp/contest-strategy/problem-classification.html'] },
          { title: 'Problem Classification — Pattern Recognition in CP', file: 'cp/contest-strategy/problem-classification.html', links: ['cp/contest-strategy/practice-methodology.html', 'cp/contest-strategy/editorial-reading.html'] },
          { title: 'How to Read Editorials &amp; Upsolve Effectively', file: 'cp/contest-strategy/editorial-reading.html', links: ['cp/contest-strategy/problem-classification.html', 'cp/contest-strategy/stress-testing.html'] },
          { title: 'Stress Testing — Generator, Brute Force &amp; Comparator Scripts', file: 'cp/contest-strategy/stress-testing.html', links: ['cp/contest-strategy/editorial-reading.html', 'cp/contest-strategy/template-advanced.html'] },
          { title: 'Advanced CP Template Features — Custom Structures &amp; Debugging Macros', file: 'cp/contest-strategy/template-advanced.html', links: ['cp/contest-strategy/stress-testing.html', 'cp/contest-strategy/time-management.html'] },
          { title: 'Time Management — Clock Management During Contests', file: 'cp/contest-strategy/time-management.html', links: ['cp/contest-strategy/template-advanced.html', 'cp/contest-strategy/mental-models.html'] },
          { title: 'Mental Models for CP — Pattern Matching &amp; Problem Reduction', file: 'cp/contest-strategy/mental-models.html', links: ['cp/contest-strategy/time-management.html', 'cp/contest-strategy/codeforces-strategy.html'] },
          { title: 'Codeforces Contest Strategy', file: 'cp/contest-strategy/codeforces-strategy.html', links: ['cp/contest-strategy/mental-models.html', 'cp/contest-strategy/icpc-strategy.html'] },
          { title: 'ICPC Team Strategy', file: 'cp/contest-strategy/icpc-strategy.html', links: ['cp/contest-strategy/codeforces-strategy.html', 'cp/contest-strategy/ioi-strategy.html'] },
          { title: 'IOI Strategy', file: 'cp/contest-strategy/ioi-strategy.html', links: ['cp/contest-strategy/icpc-strategy.html', 'cp/contest-strategy/rating-progression.html'] },
          { title: 'Rating Progression: From Beginner to Grandmaster', file: 'cp/contest-strategy/rating-progression.html', links: ['cp/contest-strategy/ioi-strategy.html', 'cp/contest-strategy/resources-roadmap.html'] },
          { title: 'Resources &amp; Roadmap — Newbie to Grandmaster', file: 'cp/contest-strategy/resources-roadmap.html', links: ['cp/contest-strategy/rating-progression.html'] }
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

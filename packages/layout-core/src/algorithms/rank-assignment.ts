import { Graph } from '../graph/graph';
import { RankMap } from '../types';
import { topologicalSort } from './topological-sort';

// export function assignRanks(graph: Graph): RankMap {
//   const order = topologicalSort(graph);
//   const ranks: RankMap = new Map();

//   order.forEach((id) => ranks.set(id, 0));

//   order.forEach((id) => {
//     const node = graph.getNode(id);
//     node?.outgoing.forEach((next) => {
//       ranks.set(next, Math.max(ranks.get(next)!, ranks.get(id)! + 1));
//     });
//   });

//   return ranks;
// }

export function assignRanks(graph: Graph): RankMap {
  const ranks: RankMap = new Map();

  // 1. Base semantic ranking (structure first)
  graph.nodes.forEach((node) => {
    if (isApplication(node)) {
      ranks.set(node.id, 0); // top layer
    } else if (isService(node)) {
      ranks.set(node.id, 1);
    } else if (isSubnet(node)) {
      ranks.set(node.id, 2);
    } else if (isVpc(node)) {
      ranks.set(node.id, 3); // bottom layer
    } else {
      ranks.set(node.id, 1); // fallback
    }
  });

  // 2. Adjust using graph flow (topological influence)
  const order = topologicalSort(graph);

  order.forEach((id) => {
    const node = graph.getNode(id);
    if (!node) return;

    node.outgoing.forEach((next) => {
      const currentRank = ranks.get(id)!;
      const nextRank = ranks.get(next)!;

      // Ensure flow goes downward (like ELK layered layout)
      if (nextRank <= currentRank) {
        ranks.set(next, currentRank + 1);
      }
    });
  });

  return ranks;
}

function isApplication(node: any): boolean {
  return ['frontend', 'backend', 'database'].includes(node.type);
}

function isService(node: any): boolean {
  return ['compute', 'network', 'security'].includes(node.type);
}

function isSubnet(node: any): boolean {
  return node.subtype === 'subnet';
}

function isVpc(node: any): boolean {
  return node.subtype === 'vpc';
}
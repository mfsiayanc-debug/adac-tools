import { Graph } from '../graph/graph';
import { RankMap, OrderingMap } from '../types';

// export function orderNodes(graph: Graph, ranks: RankMap): OrderingMap {
//   const ordering: OrderingMap = new Map();

//   ranks.forEach((rank, id) => {
//     if (!ordering.has(rank)) ordering.set(rank, []);
//     ordering.get(rank)!.push(id);
//   });

//   // Simple sort by parent average rank (minimal heuristic)
//   ordering.forEach((nodes) => nodes.sort());

//   return ordering;
// }
export function orderNodes(graph: Graph, ranks: RankMap): OrderingMap {
  const ordering: OrderingMap = new Map();

  // 1. Group nodes by rank
  ranks.forEach((rank, id) => {
    if (!ordering.has(rank)) ordering.set(rank, []);
    ordering.get(rank)!.push(id);
  });

  // 2. Sort each layer using barycenter heuristic
  ordering.forEach((nodes, rank) => {
    nodes.sort((a, b) => {
      const aNode = graph.getNode(a)!;
      const bNode = graph.getNode(b)!;

      // Compute barycenter (average position of parents)
      const aScore = getBarycenter(graph, aNode, ranks);
      const bScore = getBarycenter(graph, bNode, ranks);

      // Primary: barycenter (reduces crossings)
      if (aScore !== bScore) return aScore - bScore;

      // Secondary: degree (more connected nodes centered)
      const aDegree = aNode.incoming.size + aNode.outgoing.size;
      const bDegree = bNode.incoming.size + bNode.outgoing.size;

      return bDegree - aDegree;
    });
  });

  return ordering;
}

function getBarycenter(
  graph: Graph,
  node: any,
  ranks: RankMap
): number {
  if (!node.incoming || node.incoming.length === 0) {
    return 0;
  }

  let sum = 0;
  let count = 0;

  node.incoming.forEach((parentId: string) => {
    const parentRank = ranks.get(parentId) ?? 0;
    sum += parentRank;
    count++;
  });

  return count === 0 ? 0 : sum / count;
}
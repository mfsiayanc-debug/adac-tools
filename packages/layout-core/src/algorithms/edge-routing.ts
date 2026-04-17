import { Graph } from '../graph/graph';
import { NodePosition, EdgePath, LayoutOptions } from '../types';

// export function routeEdges(
//   graph: Graph,
//   positions: Record<string, NodePosition>,
//   options: Required<LayoutOptions>
// ): Record<string, EdgePath> {
//   const result: Record<string, EdgePath> = {};

//   graph.edges.forEach((edge, index) => {
//     const from = positions[edge.from];
//     const to = positions[edge.to];

//     const midX = (from.x + to.x) / 2;
//     const midY = (from.y + to.y) / 2;

//     result[`e${index}`] = {
//       points:
//         options.rankdir === 'TB'
//           ? [
//               { x: from.x + from.width / 2, y: from.y + from.height },
//               { x: from.x + from.width / 2, y: midY },
//               { x: to.x + to.width / 2, y: midY },
//               { x: to.x + to.width / 2, y: to.y },
//             ]
//           : [
//               { x: from.x + from.width, y: from.y + from.height / 2 },
//               { x: midX, y: from.y + from.height / 2 },
//               { x: midX, y: to.y + to.height / 2 },
//               { x: to.x, y: to.y + to.height / 2 },
//             ],
//     };
//   });

//   return result;
// }
export function routeEdges(
  graph: Graph,
  positions: Record<string, NodePosition>,
  options: Required<LayoutOptions>
): Record<string, EdgePath> {
  const result: Record<string, EdgePath> = {};

  const isTB = options.rankdir === 'TB';

  // Track parallel edges to offset them
  const edgeOffsetMap: Record<string, number> = {};

  graph.edges.forEach((edge, index) => {
    const from = positions[edge.from];
    const to = positions[edge.to];

    if (!from || !to) return;

    const key = `${edge.from}->${edge.to}`;
    const reverseKey = `${edge.to}->${edge.from}`;

    const offsetIndex =
      edgeOffsetMap[key] ??
      edgeOffsetMap[reverseKey] ??
      0;

    edgeOffsetMap[key] = offsetIndex + 1;

    const offset = offsetIndex * 12; // spacing between parallel edges

    let points;

    if (isTB) {
      // Top → Bottom layout
      const startX = from.x + from.width / 2 + offset;
      const startY = from.y + from.height;

      const endX = to.x + to.width / 2 + offset;
      const endY = to.y;

      const midY = (startY + endY) / 2;

      points = [
        { x: startX, y: startY },
        { x: startX, y: midY },
        { x: endX, y: midY },
        { x: endX, y: endY },
      ];
    } else {
      // Left → Right layout
      const startX = from.x + from.width;
      const startY = from.y + from.height / 2 + offset;

      const endX = to.x;
      const endY = to.y + to.height / 2 + offset;

      const midX = (startX + endX) / 2;

      points = [
        { x: startX, y: startY },
        { x: midX, y: startY },
        { x: midX, y: endY },
        { x: endX, y: endY },
      ];
    }

    result[`e${index}`] = { points };
  });

  return result;
}
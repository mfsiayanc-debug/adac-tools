import { Graph } from '../graph/graph';
import { RankMap, OrderingMap, NodePosition, LayoutOptions } from '../types';

// export function assignCoordinates(
//   graph: Graph,
//   ranks: RankMap,
//   ordering: OrderingMap,
//   options: Required<LayoutOptions>
// ): Record<string, NodePosition> {
//   const positions: Record<string, NodePosition> = {};

//   ordering.forEach((nodes, rank) => {
//     let offset = options.marginx;

//     nodes.forEach((id) => {
//       const node = graph.getNode(id)!;

//       if (options.rankdir === 'TB') {
//         positions[id] = {
//           x: offset,
//           y: rank * options.ranksep + options.marginy,
//           width: node.width,
//           height: node.height,
//         };
//       } else {
//         positions[id] = {
//           x: rank * options.ranksep + options.marginx,
//           y: offset,
//           width: node.width,
//           height: node.height,
//         };
//       }

//       offset += node.width + options.nodesep;
//     });
//   });

//   return positions;
// }
export function assignCoordinates(
  graph: Graph,
  ranks: RankMap,
  ordering: OrderingMap,
  options: Required<LayoutOptions>
): Record<string, NodePosition> {
  const positions: Record<string, NodePosition> = {};

  const CONTAINER_PADDING = 40; // 👈 ADD HERE

  const isTB = options.rankdir === 'TB';
  const ranksep = Math.max(options.ranksep, 150);
  const nodesep = Math.max(options.nodesep, 120);

  let maxRowWidth = 0;

  // Calculate max width for centering
  ordering.forEach((nodes) => {
    const rowWidth =
      nodes.reduce((sum, id) => sum + graph.getNode(id)!.width, 0) +
      (nodes.length - 1) * nodesep;

    maxRowWidth = Math.max(maxRowWidth, rowWidth);
  });

  // Assign positions
  ordering.forEach((nodes, rank) => {
    const rowWidth =
      nodes.reduce((sum, id) => sum + graph.getNode(id)!.width, 0) +
      (nodes.length - 1) * nodesep;

    let offset = options.marginx + (maxRowWidth - rowWidth) / 2;

    nodes.forEach((id) => {
      const node = graph.getNode(id)!;

      let x = isTB ? offset : rank * ranksep + options.marginx;
      let y = isTB ? rank * ranksep + options.marginy : offset;

      // APPLY CONTAINER OFFSET HERE
      if (isContainerChild(node)) {
        x += CONTAINER_PADDING;
        y += CONTAINER_PADDING;
      }

      positions[id] = {
        x,
        y,
        width: node.width,
        height: node.height,
      };

      offset += node.width + nodesep;
    });
  });

  return positions;
}

function isContainerChild(node: any): boolean {
  return !!node.parent; 
}
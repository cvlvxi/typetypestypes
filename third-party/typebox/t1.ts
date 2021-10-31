import { Static, Type } from "./typebox/src/typebox.ts";

const Node = Type.Rec((Self) =>
  Type.Object({
    nodeId: Type.String(),
    nodes: Type.Array(Self),
  }, { additionalProperties: false }), { $id: "Node" });

console.log(Node);

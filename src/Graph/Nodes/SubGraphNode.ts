import { BuiltinType, DumpDotNodeStyle, Graph, GraphInputNode } from '../Common.ts';
import GraphNode from './GraphNode.ts';

export default class SubGraphNode extends GraphNode {
    public graph: Graph;
    private out: GraphNode;
    private label?: string;

    public constructor(outerGraph: Graph, graph: Graph, out: GraphNode | string, label?: string) {
        super(new Map(), BuiltinType.Number);

        this.graph = graph;
        this.label = label;

        if (out instanceof GraphNode) {
            this.out = out;
        } else {
            const node = graph.get(out);
            if (node == undefined) {
                throw new Error(`Node "${out}" selected as output does not exist within the subgraph`);
            }

            this.out = node;
        }

        // Replace dependencies outside the graph with graph inputs
        for (const [_nodeName, node] of this.graph.nodes) {
            for (const [depName, [dep, depType]] of node.inputs) {
                if (dep != undefined && Array.from(this.graph.nodes.values()).find(oNode => oNode == dep) == undefined) {
                    // TODO: only works for one level of nesting, we might need a resolve function but
                    // I'm not sure the case where it'd be needed will ever occur.
                    const newInput = new GraphInputNode(Object.fromEntries([[outerGraph.findNodeEntry(dep)!.name, dep]]));
                    this.graph.inputs.set(depName, newInput);
                    node.inputs.set(depName, [newInput, depType]);
                }
            }
        }
    }

    protected _apply(graph: Graph, frame: number) {
        return this.out.getOutput(graph, frame);
    }

    protected get _nodeType(): string {
        return SubGraphNode.name.replace('Node', '');
    }

    public get dumpDotStyle(): DumpDotNodeStyle {
        return {
            label: name => `${name}`,
            attrs: {
                style: 'filled',
            },
        };
    }

    public dumpDot(name: string): string {
        const { label, attrs } = this.dumpDotStyle;
        const formattedAttrs = Object.entries(attrs).map(([name, value]) => `${name}=${value}`);
        const graphLabel = this.label != undefined ? [`\t\tlabel="${label(this.label)}"`] : [];
        return [
            `subgraph "${label(name)}" {`,
            ...graphLabel,
            ...formattedAttrs,
            this.graph.dumpDot([true, name]),
            '}',
        ].join('\n');
    }
}

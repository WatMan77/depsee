/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';

import { Graph, GraphProps } from '../../components/Graph';
import { ReactFlowProps } from 'react-flow-renderer';

const renderGraph = () => {
    const props: ReactFlowProps & GraphProps = {
        elements: [],
        setElements: () => null,
        onNodeEdit: () => null
    };
    return render(<Graph {...props} />);
};

describe('<Graph>', () => {
    test('graph is visible for users', () => {
        const component = renderGraph();
        expect(component).toBeVisible;
    });

    test('Graph contains a mini map', () => {
        const component = renderGraph();
        const miniMap = component.container.querySelector('MiniMap');

        expect(miniMap).toBeInTheDocument;
        expect(miniMap).toBeVisible;
    });
});

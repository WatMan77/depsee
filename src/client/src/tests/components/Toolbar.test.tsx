/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, RenderResult, fireEvent } from '@testing-library/react';
import { Toolbar } from '../../components/Toolbar';

describe('Toolbar', () => {
    let component: RenderResult;
    const mockCreate = jest.fn();
    const mockHidden = jest.fn();

    beforeEach(() => {
        mockCreate.mockRestore();
        component = render(
            <Toolbar
                createNode={mockCreate}
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                layoutWithDagre={async () => {}}
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                forceDirected={async () => {}}
                setNodeHidden={mockHidden}
                nodeHidden={false}
            />
        );
    });

    test('calls a function when button is clicked', () => {
        const button = component.container.querySelector('button')!;
        expect(button).toBeDefined;
        fireEvent.click(button);

        expect(mockCreate).toBeCalled;
    });

    test('renders the button with proper text', () => {
        const button = component.container.querySelector('button');

        expect(button).toHaveTextContent('Create');
    });

    test('has an empty textbox by default', () => {
        const input = component.container.querySelector('input');
        expect(input).toHaveValue('');
    });

    test('can change the text box value', () => {
        const input = component.container.querySelector('input')!;
        fireEvent.change(input, {
            target: { value: 'Add physics' },
        });
        expect(input).toHaveValue('Add physics');
    });

    test('calls a function when checkbox is checked', () => {
        const cb = component.container.querySelector('input')!;
        expect(cb).toBeDefined;
        fireEvent.change(cb, {
            target: { checked: true }
        });

        expect(cb).toBeChecked;
        expect(mockHidden).toBeCalled;
    });
});

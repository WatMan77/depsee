import { router } from '../router';
import { Request, Response } from 'express';
import { INode } from '../../../../types';
import { db } from '../../dbConfigs';
import { checkProjectPermission } from '../../helper/permissionHelper';

// Checks need to make sure the node is valid
const nodeCheck = (node: INode): boolean => {
    //Check that the node has all properties
    return Boolean(
        node.label &&
            node.status &&
            node.priority &&
            // eslint-disable-next-line no-prototype-builtins
            node.hasOwnProperty('x') &&
            // eslint-disable-next-line no-prototype-builtins
            node.hasOwnProperty('y') &&
            node.project_id
    );
};

/**
 * GET /api/node/:id
 * @summary Fetch nodes
 * @description Fetch all nodes belonging to the project
 * @pathParam {string} id - Id of the project of which to fetch nodes
 * @response 200 - OK
 * @response 401 - Unauthorized
 * @response 403 - Forbidden
 */
router
    .route('/node/:id')
    .get(async (req: Request, res: Response) => {
        const project_id = parseInt(req.params.id);

        const permissions = await checkProjectPermission(req, project_id);

        if (!permissions.view) {
            return res.status(401).json({ message: 'No permission' });
        }
        const q = await db.query('SELECT * FROM node WHERE project_id = $1', [
            project_id,
        ]);
        res.json(q.rows);
    })
    /**
     * DELETE /api/node/:id
     * @summary Delete a node
     * @description Deletes the specific node with id ':id' and all edges connected to that node
     * @pathParam {string} id - Node id
     * @response 200 - OK
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     */
    .delete(async (req: Request, res: Response) => {
        const id = req.params.id;

        const nodeQuery = await db.query(
            'SELECT project_id FROM node WHERE id = $1',
            [id]
        );

        if (nodeQuery.rowCount === 0) {
            return res.status(403).json({ message: 'Node does not exist' });
        }

        const permissions = await checkProjectPermission(
            req,
            nodeQuery.rows[0].project_id
        );
        if (!permissions.edit) {
            return res.status(401).json({ message: 'No permission' });
        }

        await db.query('DELETE FROM node WHERE id = $1', [id]);
        res.status(200).json();
    });

/**
 * POST /api/node
 * @summary Create a node
 * @description Create a new **node** for a **project**. You may need certain privilages to be able to add a node
 * @bodyContent {Node} - application/json
 * @bodyRequired
 * @response 200 - OK
 * @response 401 - Unauthorized
 * @response 403 - Forbidden
 */
router
    .route('/node')
    .post(async (req: Request, res: Response) => {
        const text: INode = req.body; //Might have to parse this

        if (nodeCheck(text)) {
            const permissions = await checkProjectPermission(
                req,
                text.project_id
            );
            if (!permissions.edit) {
                return res.status(401).json({ message: 'No permission' });
            }

            const q = await db.query(
                'INSERT INTO node (label, status, priority, project_id, x, y, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                [
                    text.label,
                    text.status,
                    text.priority,
                    text.project_id,
                    Math.round(text.x),
                    Math.round(text.y),
                    text.description,
                ]
            );
            res.status(200).json({ id: q.rows[0].id });
        } else {
            res.status(403).json({ message: 'Invalid node' });
        }
    })
    /**
     * PUT /api/node
     * @bodyRequired
     * @summary Update node(s)
     * @description Updates the value of a node(s).
     * @bodyRequired
     * @bodyContent {FullNode[]} - application/json
     * @response 200 - OK
     * @response 403 - Forbidden
     */
    .put(async (req: Request, res: Response) => {
        const data: INode | INode[] = req.body;

        let array: INode[];
        if (Array.isArray(data)) {
            const projectId = data[0].project_id;

            if (
                !data.every(
                    (p: INode) => nodeCheck(p) && p.project_id === projectId
                )
            ) {
                return res
                    .status(403)
                    .json({ message: 'Invalid node or multiple projectIds' });
            }

            const permissions = await checkProjectPermission(req, projectId);
            if (!permissions.edit) {
                return res.status(401).json({ message: 'No permission' });
            }

            array = data;
        } else {
            const permissions = await checkProjectPermission(
                req,
                data.project_id
            );

            if (!permissions.edit) {
                return res.status(401).json({ message: 'No permission' });
            }

            array = [data];
        }

        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            for (const node of array) {
                await client.query(
                    'UPDATE node SET label = $1, status = $2, priority = $3, x = $4, y = $5, description = $6 WHERE id = $7',
                    [
                        node.label,
                        node.status,
                        node.priority,
                        Math.round(node.x),
                        Math.round(node.y),
                        node.description,
                        node.id,
                    ]
                );
            }
            client.query('COMMIT');
            res.status(200).json();
        } catch (e) {
            // eslint-disable-next-line no-console
            await client.query('ROLLBACK');
            res.status(403).json();
        } finally {
            client.release();
        }
    });

export { router as node };

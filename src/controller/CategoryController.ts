import * as express from 'express';
import { injectable, inject } from 'inversify';
import TYPES from '../types';
import { RegistrableController } from './RegisterableController';
import { ResponseUtil } from '../util/response-utils';
import { Status } from '../model/ResponseDto';
import { CategoryService } from '../service/CategoryService';
import to from '../util/promise-utils'

@injectable()
export class CategoryController implements RegistrableController {
    private categoryService: CategoryService;
    private responseUtils: ResponseUtil;

    constructor( @inject(TYPES.CategoryService) _categoryService: CategoryService,
        @inject(TYPES.ResponseUtil) _responseUtils: ResponseUtil) {
        this.categoryService = _categoryService;
        this.responseUtils = _responseUtils;
    }

    public register(app: express.Application): void {
        app.route('/api/category/search')
        .post(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let result = await (this.categoryService.query(req.body));
            res.json(result);
        })
    }
}

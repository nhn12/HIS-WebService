import { ScheduleDto } from './../model/ScheduleDto';
import {injectable, inject} from 'inversify';
import TYPES from '../types';
import 'reflect-metadata';
import * as _ from 'lodash';
import { ResponseModel, Status } from '../model/ResponseDto';
import to from '../util/promise-utils';
import { WardRepository } from '../repository/WardRepository';


export interface WardService {
    insert(obj: any): Promise<any>;
    update(obj: any): Promise<ResponseModel<any>>;
}

@injectable()
export class WardServiceImpl implements WardService {
    @inject(TYPES.WardRepository)
    private scheduleRepository: WardRepository;


    public async insert(obj: any): Promise<any> {
        return await this.scheduleRepository.insert(obj);
    }

    public async update(obj: any): Promise<ResponseModel<any>> {
        throw new Error("Method not implemented.");
    }

  




 
}

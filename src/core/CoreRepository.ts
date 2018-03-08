import { CounterRepository } from './../repository/CounterRepository';
import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import to from '../util/promise-utils';
import TYPES from '../types';
import { inject, injectable } from 'inversify';

@injectable()
export abstract class CoreRepository<D> {
    col: mongoose.Model<any>;

    @inject(TYPES.CounterRepository)
    protected counterRepository: CounterRepository;
    
    constructor() {
        this.initCollection();
    }

    public abstract setPrimaryTable(): string;
    public abstract setSchema(): Schema;

    public async findAll(): Promise<Array<D>> {
        let data = await this.col.find({deleted_flag: false});
        let result: D[] = [];
        return Object.assign<D[], mongoose.Document[]>(result, data);
    }


    public initCollection() {
        this.col = mongoose.model(this.setPrimaryTable(), this.setSchema(), this.setPrimaryTable() );
    }

    public async insert(obj: D[]): Promise<D[]> {
        let[errC, seqC] = await to(this.counterRepository.getNextSequenceValue(this.setPrimaryTable(), obj.length));

        if(errC) {
            return Promise.reject(errC);
        }

        obj.forEach(element=>{
            element['id'] = seqC++;
        })

        let[err, response] = await to(this.col.insertMany(obj));

        if(err) {
            return Promise.reject(err);
        }

        return response;
    }

    public async update(obj: D) {
        obj['updated_date'] = new Date();
        let [err, data] = await to(this.col.updateMany({id : obj['id']},  { $set:  obj }))
        
        if(err) {
            return Promise.reject(err);
        }

        return data;
    }

    public async delete(obj: D) {
        let [err, data] = await to(this.col.updateMany({id : obj['id']},  { $set: { "deleted_flag" : true }}))
        if(err) {
            return Promise.reject(err);
        }

        return data;
    }
}
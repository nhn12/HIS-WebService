import { BlueprintScheduleDto } from './../model/BlueprintScheduleDto';
import { BlueprintScheduleRepository } from './../repository/BlueprintScheduleRepository';
import { ScheduleDto } from './../model/ScheduleDto';
import { injectable, inject } from 'inversify';
import TYPES from '../types';
import 'reflect-metadata';
import * as _ from 'lodash';
import { ScheduleRepository } from '../repository/ScheduleRepository';
import { ResponseModel, Status } from '../model/ResponseDto';
import { SchedulePeriodDto } from './dto/SchedulePeriodDto';
import { ScheduleAbsoluteDto } from './dto/ScheduleAbsoluteDto';
import to from '../util/promise-utils';
import { ParseUtils } from '../util/parse-utils';


export interface ScheduleService {
    insert(obj: any): Promise<ResponseModel<any>>;
    delete(obj: ScheduleDto): Promise<ResponseModel<any>>;
    update(obj: ScheduleDto): Promise<ResponseModel<any>>;
}

@injectable()
export class ScheduleServiceImpl implements ScheduleService {
    @inject(TYPES.ScheduleRepository)
    private scheduleRepository: ScheduleRepository;

    @inject(TYPES.BlueprintScheduleRepository)
    private bluePrintRepository: BlueprintScheduleRepository;

    public async insert(obj: any): Promise<ResponseModel<any>> {        
        if (!obj) {
            return new ResponseModel(Status._400, "lack of data");
        }
        obj.mode = 'period';

        // Get list blueprint schedule
        let [errBlue, blueList] = await to<BlueprintScheduleDto[]>(this.bluePrintRepository.findAll());
        if (!blueList || blueList.length <= 0) {
            console.log(obj);
            return new ResponseModel(Status._500, "Blueprint schedule empty");
        }
        // Split each blueprint
        let scheduleList:ScheduleDto[] = [];
        for(var i=0;i<blueList.length;i++){
            let pathDate: Date[] = ParseUtils.splitDate(obj.start_time, obj.end_time);
            pathDate.forEach(date => {
                let tempBlue = new SchedulePeriodDto();
                tempBlue.start_time = ParseUtils.convertStringTime(blueList[i].start_time, date);
                tempBlue.end_time = ParseUtils.convertStringTime(blueList[i].end_time, date);
                tempBlue.period = blueList[i].period.valueOf();

                let tempSchedule = this.insertPeriod(tempBlue);
                tempSchedule = tempSchedule.map(value=>{
                    value.specialization_id = blueList[i].specialization_id;
                    value.ward_id = blueList[i].ward_id;
                    value.period = value.period.valueOf()/60000;
                    return value;
                });

                scheduleList.push(...tempSchedule);
            })
        }
        console.log(scheduleList);
        await this.scheduleRepository.insert(scheduleList);
        this.Sync(scheduleList);
        return new ResponseModel(Status._200, "lack of data"); 
    }

    public async delete(obj: ScheduleDto): Promise<ResponseModel<any>>{
        if(!obj) {
            return new ResponseModel(Status._400, "lack of data");
        }
        let [err, result] = await to(this.scheduleRepository.delete(obj));
        if(err) {
            return new ResponseModel(Status._500, "err");
        }

        return new ResponseModel(Status._200, "success", result);
    }

    public async update(obj: ScheduleDto): Promise<ResponseModel<any>> {
        if(!obj) {
            return new ResponseModel(Status._400, "lack of data");
        }
        let [err, result] = await to(this.scheduleRepository.update(obj));
        if(err) {
            return new ResponseModel(Status._500, "err");
        }

        return new ResponseModel(Status._200, "success", result);
    }

    private insertAbsolute(obj: ScheduleAbsoluteDto): ScheduleDto[] {
        let schedule: ScheduleDto = new ScheduleDto();

        schedule.start_time = obj.start_time;
        schedule.end_time = obj.end_time;
        return [schedule];

    }

    private insertPeriod(obj: SchedulePeriodDto): ScheduleDto[] {
        obj.start_time = new Date(obj.start_time);
        obj.end_time = new Date(obj.end_time);
        let distance = obj.end_time.getTime() - obj.start_time.getTime();
        obj.unit_period = 'm';
        if (obj.unit_period == 'h') {
            obj.period = obj.period * 60 * 60 * 1000;
        }

        if (obj.unit_period == 'm') {
            obj.period = obj.period * 60 * 1000;
        }

        let count = distance / obj.period;
        let schedule: ScheduleDto[] = [];
        for (var i = 0; i < count; i++) {
            let tempSchedule = new ScheduleDto();

            tempSchedule.is_interval = true;
            tempSchedule.period = obj.period;

            tempSchedule.start_time = new Date(obj.start_time.getTime() + obj.period * i);
            tempSchedule.end_time = new Date(obj.start_time.getTime() + obj.period * (i + 1));

            schedule.push(tempSchedule);
        }

        return schedule;
    }

    public Sync(obj: any)
    {
        console.log("sync");
        
        function groupBy( array , f )
        {
        var groups = {};
        array.forEach( function( o )
        {
            var group = JSON.stringify( f(o) );
            groups[group] = groups[group] || [];
            groups[group].push( o );  
        });
        return Object.keys(groups).map( function( group )
        {
            return groups[group]; 
        })
        }

        var result = groupBy(obj, function(item)
        {
        return item.ward_id;
        });

        var lstItemSync = new Array();
        result.forEach(element => {
            element.forEach(item => {
                var itemSync = {
                    "is_interval": item.is_interval,
                    "period": item.period,
                    "start_date": ParseUtils.convertToFormatDateSync(item.start_time),
                    "start_time": ParseUtils.convertToFormatTimeSync(item.start_time),
                    "specialization_id": item.specialization_id,
                    "ward_id": item.ward_id,
                    "id": item.id
                    };
                    lstItemSync.push(itemSync);
            });
        });  
        
        console.log(lstItemSync);

        var groupItemSync = groupBy(lstItemSync, function(item)
        {
        return item.ward_id, item.start_date;
        });

        console.log(groupItemSync);

    }





}

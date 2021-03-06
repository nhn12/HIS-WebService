import { StaffDto } from "./StaffDto";

export class DoctorDto {
    public id: Number;
    public code: String;
    public name: String;
    public firstname: String;
    public lastname: String;
    public gender: String;
    public birthday: String;

    public address: String;
    public province_id: Number;
    public district_id: Number;
    public commune_id: Number;
    public hospital_id: Number[];

    public staff_id: number;
    public username: String;
    public password: String;


    public staff: StaffDto;

    public specialization_id: Number;

    public updated_date: Number;
}

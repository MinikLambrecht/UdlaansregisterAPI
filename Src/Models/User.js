export class UserModel {
    constructor(data) {
        this.user_id = data.user_id;
        this.name = data.name;
        this.password = data.password;
        this.address = data.address;
        this.city = data.city;
        this.SSN = data.SSN;
        this.email = data.email;
        this.class = data.class;
        this.role_id = data.role_id;
    }
};
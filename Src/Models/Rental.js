export class RentalModel {
    constructor(data) {
        this.rental_id = data.rental_id;
        this.user_id = data.user_id;
        this.hw_id = data.hw_id;
        this.rental_start = data.rental_start;
        this.rental_end = data.rental_end;
    }
};
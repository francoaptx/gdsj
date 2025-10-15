import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkdaysService {
  addWorkdays(date: Date, days: number): Date {
    const result = new Date(date);
    let addedDays = 0;
    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        // Lunes=1 ... Viernes=5 (0=domingo, 6=sábado)
        addedDays++;
      }
    }
    return result;
  }
}

import { Component, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './records.component.html',
  styleUrl: './records.component.css'
})
export class RecordsComponent implements OnInit {
  records: any[] = [];  // Store the records in a property

  constructor() {}

  ngOnInit(): void {
    // Fetch records when the component initializes
    this.fetchRecords();
  }

  async fetchRecords() {
    try {
      const url = `http://wd.etsisi.upm.es:10000/records`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch records.");
      }

      const records = await response.json();
      this.records = records;  // Assign the fetched records to the component property
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  }

  formatDate(recordDate: string): string {
    return recordDate ? new Date(recordDate).toLocaleDateString() : 'N/A';
  }

}

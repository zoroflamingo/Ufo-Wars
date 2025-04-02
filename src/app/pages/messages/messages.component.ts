import { Component, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent {
  userName: string = '';
  errorMessage: string = ''; 
  showConfirmDialog: boolean = false;
  showDeleteButton = true;
  messages: any[] = [];  // Store the records in a property
  constructor() {}

  ngOnInit(): void {
    // Fetch records when the component initializes
    this.fetchMessages();
  }

  async fetchMessages() {
    try {
      const url = `http://wd.etsisi.upm.es:10000/messages`;
      const token = localStorage.getItem('authToken');
      console.log(token)
      if (!token) {
        this.errorMessage = 'You must be logged in to view messages.';
        return;
      }
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "accept": "application/json",
          'Authorization': `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages.");
      }
      const messages = await response.json();
      this.messages = messages;  // Assign the fetched records to the component property
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }



  formatDate(date: number): string {
    if (!date) return 'N/A';  // Handle undefined or null date
    const dateObj = new Date(date); // Convert from timestamp
    return dateObj.toLocaleString(); // Convert date to local string format
  }

  confirmDeletion() {
    this.showConfirmDialog = true;
    this.showDeleteButton = false;
  }

  // Cancel the deletion process
  cancelDeletion() {
    this.showConfirmDialog = false;
    this.showDeleteButton = true;
  }

  // Delete all messages
  async deleteMessages() {
    try {
      const username = localStorage.getItem('username');
      if (!username) {
        throw new Error("Username not found");
      }
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error("No token found");
      }
      const url = `http://wd.etsisi.upm.es:10000/messages/${username}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "accept": "application/json",
          "Authorization": `${token}`,
        },
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Failed to delete messages: ${responseText}`);
      }

      // Messages deleted successfully, refresh the page
      this.messages = [];  // Clear the current messages
      this.showConfirmDialog = false;  // Hide confirmation dialog
      this.showDeleteButton = true;
      window.location.reload();
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  }
}

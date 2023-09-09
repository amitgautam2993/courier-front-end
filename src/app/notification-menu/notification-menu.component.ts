import { Component, OnInit } from '@angular/core';

interface Notification {
  message: string;
  timestamp: Date;
  isRead: boolean;
}

@Component({
  selector: 'app-notification-menu',
  templateUrl: './notification-menu.component.html',
  styleUrls: ['./notification-menu.component.scss']
})

export class NotificationMenuComponent implements OnInit {

  notifications: Notification[] = []; // Define the array to store notifications



  
  ngOnInit(): void {

    this.notifications = [

    ];

  }

  // Add a method to handle notification item click action
  handleNotificationClick(notification: Notification): void {
    // Implement the action here, e.g., navigate to a related page
  }

  // Add a method to mark a notification as read
  markNotificationAsRead(notification: Notification): void {
    // Implement logic to mark the notification as read
    notification.isRead = true;
  }

  // Add a method to remove a notification
  removeNotification(notification: Notification): void {
    const index = this.notifications.indexOf(notification);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }


}

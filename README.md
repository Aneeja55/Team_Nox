# [Project Name]
meSSET🎯


## Basic Details
### Team Name: NOX


### Team Members
- Member 1: Anagha TR - SCMS School of engineering and technology
- Member 2: Anaya Wilson - SCMS School of engineering and technology
- Member 3: Aneeja J - SCMS School of engineering and technology

### Hosted Project Link
https://team-nox-sable.vercel.app/

### Project Description
This project is a Digital Mess Card System built with Next.js and Node.js, designed to streamline meal tracking in a cafeteria or mess. It features user authentication with a login page and a dashboard that includes meal components for Lunch and Snack. Each component flips to reveal a QR code scanner, which validates meal consumption within specific time slots (11:30 AM – 2:00 PM for Lunch and 3:30 PM – 5:00 PM for Snack). Users can scan only once per day; multiple scans trigger a beep sound, and the calendar updates—green for a successful scan and red/brown for multiple scans. The dashboard also includes a menu display and logout option for better user experience.

### The Problem statement
In hostels, students are provided with physical mess cards to access meals in the mess. These cards serve as proof of their eligibility to avail of the mess facilities. However, the reliance on physical cards poses several problems 
1. Frequent Loss of Cards: Students often misplace their mess cards, leading to the need for replacements.
2. Additional Costs: Students incur extra expenses every time they need to replace a lost or damaged card.
3. Inconvenience: Carrying and maintaining a physical card is cumbersome for students.
4. Manual Verification: Mess staff must manually check each card, which is time-consuming and error-prone.

### The Solution
A modern solution designed to replace traditional physical mess cards for hostellers. This system provides a secure, convenient, and efficient way for students to access mess facilities while eliminating the hassles of lost or damaged physical cards. This application ensures a seamless user experience with advanced features like QR code scanning, real-time tracking, and more.
Key Features
1. Secure Login Page
Only registered students can log in using their credentials.
Ensures secure access to the digital mess card system.
2. Home Page with Lunch and Snacks Options
The landing page (home page) provides two options:
Lunch
Snacks
3. QR Code Scanner
Students can scan their QR code during scheduled times:
Lunch: 11:30 AM to 2:00 PM
Snacks: 3:30 PM to 5:00 PM
Only one scan per person per day is allowed for each meal.
If a student tries to scan more than once, the system produces a beep sound to alert them.
4. Real-Time Calendar Updates
After a successful scan, the system updates the student's calendar:
Lunch: Marks the day with a green color.
Snacks: Marks the day with a brown color.
If a student scans more than once, the calendar updates to red for that day.
5. Profile Page
Students can view their profile details, including:
Name
Registration Number
Meal History
6. Logout Option
Students can securely log out of the system when done.

How It Works
1. Login:
Students log in using their registered credentials.
Unregistered users cannot access the system.
2. Home Page:
After logging in, students are directed to the home page.
They can choose between Lunch or Snacks.
3. QR Code Scanning:
Students scan the unique QR code provided below at the canteen during the scheduled time.
![WhatsApp Image 2025-02-09 at 12 01 25 PM](https://github.com/user-attachments/assets/54766282-984b-4db3-8e86-bb6a9220caf2) (Unique QR code)

The system validates the scan and updates the calendar.
5. Calendar Updates:
Successful scans are reflected in the calendar with appropriate colors:
Green for lunch.
Brown for snacks.
Red for multiple scans.
6. Profile and Logout:
Students can view their profile and meal history.
They can log out securely when done.

## Technical Details
### Technologies/Components Used
For Software:
- Frontend - React.js
- Backend - Node.js
- Frameworks used - Next.js
- Libraries:
    bcryptjs
    cors 
    dotenv 
    express
    jsonwebtoken
    mongoose
- vs code, mongodb

### Implementation
For Software:
# Installation
npm install

# Run
npm run dev

### Project Documentation
For Software:

# Screenshots (Add at least 3)
![image](https://github.com/user-attachments/assets/5d75d87b-0db4-4f16-8a9e-474b7c4378cf)    Login page
Login page where user can login

![image](https://github.com/user-attachments/assets/fd33b593-01b9-405b-9385-4c659353e098)    Lunch/snack- Home page
You can choose between lunch and snack and scan qr code


![image](https://github.com/user-attachments/assets/1390c782-aeaf-4a84-acae-c69a4189b98f)    QR code Scanner
Scan qr code using the camera provided which will check whether user has already scanned or not

# Diagrams
![WhatsApp Image 2025-02-09 at 11 29 07 AM](https://github.com/user-attachments/assets/a2fd4a06-0216-4f81-9632-b02ec9d47cf1)


# Build Photos
![WhatsApp Image 2025-02-09 at 11 32 34 AM](https://github.com/user-attachments/assets/d96f1a24-d4aa-4043-b968-3b8766505b89)


### Project Demo
# Video
https://drive.google.com/drive/folders/1wFapt07b-orFGPWAYXm6d8hmbS8-B_-X?usp=drive_link
How the scanning process works and how the message thereafter received 

# Additional Demos
https://www.figma.com/design/YlndODZ7JhRPBQn1pCNeLw/Untitled?node-id=0-1&m=dev&t=H5hhkkWYD3v2RHrW-1
This is how we originally intended the project to be. If possible we will modify our existing project as we originally intended

## Team Contributions
- Aneeja J: Backend with node js
- Anagha TR: Frontend with next js
- Anaya Wilson: Frontend with next js

---
Made with ❤️ at TinkerHub

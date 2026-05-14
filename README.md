# iGEM OSAGE Application

A full-stack application built for the iGEM OSAGE project, combining hardware integration, real-time data handling, and an interactive frontend dashboard for monitoring and control.

Built with a React frontend, Node.js backend, Raspberry Pi scripting, and Arduino integration.

---

## Overview

The iGEM OSAGE Application is designed to bridge biological experimentation with accessible software tooling. The platform enables:

- Real-time communication between hardware and software
- Sensor/device integration through Arduino and Raspberry Pi
- A responsive web dashboard for user interaction
- Modular architecture for future iGEM expansion and experimentation

This repository contains:

| Directory | Purpose |
|---|---|
| `my-app/` | React frontend application |
| `PiScript/` | Raspberry Pi scripts and hardware communication: Legacy Code |
| `ArduinoScript/` | Arduino firmware and device logic |

---

## Tech Stack

### Frontend
- React
- JavaScript
- CSS

### Backend / Hardware
- Node.js
- Raspberry Pi (Python)
- Arduino (C)
---


# Getting Started
## Prerequisites

Before running the project, make sure you have installed:

- Node.js
- npm
- Python (for Raspberry Pi scripts)
- Arduino IDE (for firmware uploads)

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/MattMacMaster/iGemApplication.git
cd iGemApplication
```

---

## 2. Frontend Setup

Navigate into the frontend directory:

```bash
cd my-app
npm install
npm start
```

The frontend will launch locally at:

```bash
http://localhost:3000
```

---

## 3. Backend Setup

If your backend/server exists separately:

```bash
cd server
npm install
node index.js
```

---

## 4. Raspberry Pi Scripts

Navigate to the Pi scripts directory:

```bash
cd PiScript
```

Run the appropriate Python script:

```bash
python3 script_name.py
```

---

## 5. Arduino Setup

1. Open the `ArduinoScript` folder in the Arduino IDE
2. Connect your Arduino device
3. Select the correct board and port
4. Upload the firmware

---

# License

This project is open source and available under the MIT License.

---

# Acknowledgements

Built as part of the iGEM initiative to support interdisciplinary innovation in synthetic biology, hardware integration, and computational tooling.

---

## Repository

[iGemApplication GitHub Repository](https://github.com/MattMacMaster/iGemApplication)

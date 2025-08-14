# Supply Chain Transparency Network for Sustainable Trade


## Table of Contents
- [About the Project](#about-the-project)
- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Implementation Roadmap](#implementation-roadmap)
- [UN SDG Alignment](#un-sdg-alignment)
- [Team](#team)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

---

## About the Project

[🎥 Watch the Demo on YouTube](https://www.youtube.com/watch?v=bHE3K-4kkTg&feature=youtu.be)

Global supply chains today suffer from opacity, inefficiencies, and a lack of verifiable provenance. Our *Supply Chain Transparency Network* harnesses the power of blockchain to ensure every step—from raw material sourcing to final delivery—is recorded immutably. Through real-time updates, QR-based tracking, and decentralized certification, stakeholders and consumers alike gain confidence in the authenticity and sustainability of the products they handle and purchase.

## Problem Statement

- *Lack of Transparency:* Difficulty verifying true origin and sustainability claims.
- *Inefficiencies:* Manual processes lead to delays and errors.
- *Limited Accountability:* Tainted records undermine trust.

## Solution Overview

1. *Product Registration:* Manufacturers register items on Ethereum smart contracts, embedding product details and certification metadata. A unique QR code is generated for each product.
2. *Real-Time Tracking:* Logistics partners scan QR codes at checkpoints, logging GPS coordinates and timestamps on-chain. No single party can tamper with the record.
3. *Certifying Authority Integration:* Accredited bodies upload validated sustainability credentials (e.g., Fair Trade, Organic) to IPFS; hashes are linked on-chain for immutable proof.
4. *Consumer Transparency:* End-users scan the QR code to trace the entire journey—view source, certifications, handlers, and final delivery status—all via a sleek front-end dashboard.
5. *Immutable Ledger:* All interactions are permanently stored on a shared ledger, eliminating data silos and fostering trust.

## Key Features

- 🚀 *Immutable Records:* Blockchain ensures tamper-proof tracking.
- 📍 *GPS-Enabled Checkpoints:* Real-time location logs for full visibility.
- 🔗 *IPFS Integration:* Decentralized storage of certificates and documents.
- 📱 *QR Code Interface:* Simple scanning flow for all participants.
- 📊 *Stakeholder Dashboards:* Custom views for manufacturers, carriers, certifiers, and consumers.

## Architecture!
![Architecture Diagram](https://github.com/user-attachments/assets/3ba3368b-e018-45ce-bda1-3c798009f72f)
![Use-Case Diagram](https://github.com/user-attachments/assets/cd67b9ae-f8a2-4f16-bd66-7e77741a25ec)



1. *Frontend:* React.js application for stakeholders and consumers.
2. *Backend API:* Node.js/Express service interfacing with blockchain and database.
3. *Blockchain Layer:* Ethereum smart contracts handle registration, tracking, and validation.
4. *Data Storage:* MongoDB for transaction metadata; IPFS for certificate files.

## Tech Stack

- *Blockchain:* Solidity, Ethereum (Layer 2)
- *Web3:* Web3.js, Hardhat
- *Frontend:* React, Tailwind CSS
- *Backend:* Node.js, Express, Firebase Realtime Database
- *Database:* MongoDB, IPFS
- *Mobile Tracking:* ZXing.JS for QR, GPS & GSM SIM APIs
- *Tools & Libraries:* Git, GitHub, TensorFlow, Scikit-Learn

## Implementation Roadmap

| Phase                  | Milestone                                    | 
|------------------------|----------------------------------------------|
| Planning               | Define use-cases & partners                  | 
| Smart Contracts        | Develop & deploy product registration module |
| QR & Tracking          | Integrate QR generation & GPS logging        | 
| Certifier Integration  | Connect IPFS storage & on-chain verification | 
| Frontend & Dashboards  | Stakeholder & consumer UIs                   | 
| Testing & Deployment   | End-to-end QA and launch                     | 

## UN SDG Alignment

Our solution advances *SDG 17: Partnerships for the Goals* by:

1. Fostering cross-sector collaboration among manufacturers, logistics, and certifying bodies.
2. Empowering SMEs with affordable, transparent supply chain tools.
3. Driving sustainable trade through verifiable credentials.

## Team

| Member           | LinkedIn                                            | GitHub                        |
|------------------|-----------------------------------------------------|-------------------------------|
| Binayak          | https://linkedin.com/in/binayak16                   | https://github.com/ZenMachina16 |
| Tejas Patil      | https://linkedin.com/in/tejaspatil4032              | https://github.com/tejas4032  |
| Harsh Kapse      | https://linkedin.com/in/harsh-kapse-b921112ab       | https://github.com/kap432     |
| Atharva Phadtare | https://linkedin.com/in/atharva-phadtare-042b16259  | https://github.com/atharvamp04|


## Getting Started

1. *Clone the repo*
   bash
   git clone https://github.com/tejas4032/TraceCraft.git
   cd supply-chain-transparency
   
2. *Install dependencies*
   bash
   npm install   # for frontend and backend
   
3. *Configure environment*
   - Rename .env.example to .env and fill in your keys (RPC URL, private key, Firebase, IPFS gateway).
   - Fill in your keys in .env file and Firebase.js according to your setup.

4. *Start the Blockchain Server*
   bash
   ganache-cli
   

5. *Initialize and Run Truffle*
   bash
   truffle init
   truffle compile
   truffle migrate --network development
   truffle test
   

6. *Start Frontend & Backend*
   bash
   npm run start  # runs both the frontend and backend services
   

7. *Explore!*
   - Visit http://localhost:3000 to register, track, and verify your products.
   

## Contributing

Contributions are welcome! Please open issues or submit pull requests against the develop branch. Refer to CONTRIBUTING.md for guidelines.

## License

Distributed under the MIT License. See LICENSE for more information.

---

&copy; 2025 The Code of Duty

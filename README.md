# Team Aphelion CanSat | 🏆 1st Place in Canada 2024 | Represented Canada at European Space Agency

## Project repo for Eric Hamber Secondary School from Vancouver, Canada.
### 

![image](https://github.com/flatypus/TeamAphelionCansat/assets/68029599/465017f2-cdfc-444c-9a90-74c7ac1a8d0d)


### Team Members:
- [Tristan Yan-Klassen](https://www.linkedin.com/in/tristan-yan-klassen-510788275/) - Co-Captain and Mission Leader
  - Soil Sample Intake and Testing
- [Jason Huang](https://www.linkedin.com/in/jason-huang-342449250/) - Co-Captain and Lead Engineer
  - PCB Design and Assembly
  - Electrical Design
  - CanSat Structure
- [Hinson Chan](https://github.com/flatypus) - Software Lead
  - Ground Station Software
  - Map Library Development
  - Website Development
- [John Xu](https://youtube.com/@ibuildstuff) - Hardware Lead
  - Landing Apparatus
  - Soil Sample Intake
  - Ground Station Hardware
- [Anthony Lu](https://www.linkedin.com/in/anthony-lu-026628241/) - External Communications
  - Outreach
  - Parachute Testing
- Mendel Rieseberg - Ground Control
  - Radio Communications


### Project abstract

The goal of CanSat is to design and build a small satellite that fits inside a 330ml soda can. The satellite will be launched to an altitude of 1km and will be deployed to land safely on the ground. We must equip the satellite with sensors to measure temperature, pressure, altitude, and location.

### This Repository

The project is split into four subdirectories:
- 'backend': The backend server for the ground station
- 'mission-control': The frontend dashboard for the ground station
- 'landing': The landing page for the website
- 'embedded': The Arduino code for the CanSat microcontroller

The embedded code consists of sensors detecting temperature, pressure, altitude, and location. The data is sent to the ground station via radio communication, which is relayed via socket communication to the frontend dashboard. The dashboard then visualizes that information in the form of graphs, a map showing the CanSat's location, and the live 3D rotation of the CanSat.

## Project Presentation

This CanSat is designed to complete the primary mission, which is to send temperature and pressure data to the ground station live, at least once a second via radio. The CanSat also has a secondary mission, which is to drill into soil, take a soil sample, and test it with a ninhydrin chemical test within the CanSat's internal chamber. Using the CanSat's FPV live camera, we will determine the presence of amino acids in the soil if a change of color is shown in the ninhydrin.

To accomplish this, the CanSat will be first launched in a rocket to around 1km, then deployed with a parachute to descend at around 6m/s. When the CanSat lands, it will be on its side; we will send a command through our ground station to release the landing legs, which will spring the CanSat upright. We will then initiate the drill, which will drill a hole through our waterproof water chamber, releasing the water onto the soil to dampen it. The CanSat will then continue drilling into the soil, picking up a sample of wet soil, and then stop drilling and retracting up into the CanSat body. The ninhydrin chamber will swivel into place, where then the drill will lower into the chemical, allowing the soil to begin the chemical test. All of this will be remotely controlled from our dashboard.

![image](https://github.com/flatypus/TeamAphelionCansat/assets/68029599/4f74ddd0-e566-4af4-8859-4af436c91ec3)


### Custom Designed Printed Circuit Board
- Designed by Jason on KiCad


![image](https://github.com/flatypus/TeamAphelionCansat/assets/68029599/61ea326a-2921-4ace-96f3-f9093501040e)


### Software/Ground Control
- CanSat onboard programming written in Arduino
  - Written for Teensy 4.0, so it supports 'multithreading' (with careful process jumping)
- Nextjs frontend + ExpressJS backend, written by Hinson
  - Data path: Onboard sensors -> Arduino serial -> Radio -> WebSocket backend -> Nextjs graph
- Graphs showing live data updates (temperature, pressure, calculated altitude)
- Fully-functional offline (no WIFI) slippy map
  - You can also embed it as a react component with `bun i react-offline-maps`
  - OSM tile layers; tile caching
- Gyrometer data 3D (threejs)
- Control motors live with Bidirectional communication
  - Buttons send message via. data path in reverse:
  -  Websockets -> Radio -> Serial read -> parse as commands -> send power to pin

![image](https://github.com/flatypus/TeamAphelionCansat/assets/68029599/e3829b9f-d954-46f8-87cd-284ac29d4612)

### Cost Breakdown
![image](https://github.com/flatypus/TeamAphelionCansat/assets/68029599/d6b4b124-a2fb-4ea4-ae6f-68d0d1bc5b8d)

### PCB Cost Breakdown
![image](https://github.com/flatypus/TeamAphelionCansat/assets/68029599/de44e27b-3906-42fb-bf6e-2ec833c07f3d)








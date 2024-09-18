# Team Aphelion CanSat | 🏆 1st Place in Canada 2024 | Represented Canada at European Space Agency

## Project repo for Eric Hamber Secondary School from Vancouver, Canada.
### 

![image](https://github.com/flatypus/TeamAphelionCansat/assets/68029599/465017f2-cdfc-444c-9a90-74c7ac1a8d0d)

![image](https://github.com/user-attachments/assets/33fb12a7-b240-4fc6-82a6-76a157b03e1a)

### Team Members:
- [Jason Huang](https://www.linkedin.com/in/jason-huang-342449250/) - Co-Captain and Lead Engineer
  - Electrical Design Lead
  - PCB Design and Assembly
  - Mechanical Design and Fabrication
  - CanSat Integration
- [Tristan Yan-Klassen](https://www.linkedin.com/in/tristan-yan-klassen-510788275/) - Co-Captain and Mission Leader
  - Mechanical Design and Fabrication Lead
  - Drilling Apparatus Design and Assembly
  - CanSat Body and Systems Integration
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

The goal of CanSat is to design and build a small satellite that fits inside a 330mL soda can. The satellite will be launched to an altitude of 1km and will be deployed to land safely on the ground. We must equip the satellite with sensors to measure temperature, pressure, altitude, and location.

### This Repository

The project is split into six subdirectories:
- 'backend': The backend server for the ground station
- 'mission-control': The frontend dashboard for the ground station
- 'landing': The landing page for the website
- 'embedded': The Arduino code for the CanSat microcontroller
- 'hardware': The electrical schematics and PCB manufacturing files
- 'mechanical': The CAD files of our CanSat

The embedded code consists of sensors detecting temperature, pressure, altitude, and location. The data is sent to the ground station via radio communication, which is relayed via socket communication to the frontend dashboard. The dashboard then visualizes that information in the form of graphs, a map showing the CanSat's location, and the live 3D rotation of the CanSat.

## Project Presentation

This CanSat is designed to complete the primary mission, which is to send temperature and pressure data to the ground station live, at least once a second via radio. The CanSat also has a secondary mission, which is to drill into soil, take a soil sample, and test it with a ninhydrin chemical test within the CanSat's internal chamber. Using the CanSat's FPV live camera, we will determine the presence of amino acids in the soil if a change of color is shown in the ninhydrin.

To accomplish this, the CanSat will be first launched in a rocket to around 1km, then deployed with a parachute to descend at around 6m/s. When the CanSat lands, it will be on its side; we will send a command through our ground station to release the landing legs, which will spring the CanSat upright. We will then initiate the drill, which will drill a hole through our waterproof water chamber, releasing the water onto the soil to dampen it. The CanSat will then continue drilling into the soil, picking up a sample of wet soil, and then stop drilling and retracting up into the CanSat body. The ninhydrin chamber will swivel into place, where then the drill will lower into the chemical, allowing the soil to begin the chemical test. All of this will be remotely controlled from our dashboard.

### Mechanical Design
- Designed in SolidWorks and 3D printed by Tristan, Jason, and John. 
- Custom drill bit and other parts machined to fit inside the CanSat body.
- 4 motors used: GB 2208 Gimbal motor for drilling, 5g servo for testing chamber, N20 worm gear motor for leg release, and 2.5g servo for lead screw.

![image](https://github.com/user-attachments/assets/5aa373f0-cc04-44e3-b651-f04aba4a6766)

### Custom Designed Printed Circuit Board
- Designed and hand-assembled by Jason on KiCad


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









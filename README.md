# CSDCMS CanSat 2024 | Team Aphelion

## CanSat repo for Eric Hamber Secondary School, from Vancouver, BC, Canada.

### Team Members:
- [Hinson Chan](https://github.com/flatypus) - Software Lead
  - Ground Station Software
  - Map Library Development
  - Website Development
- [Jason Huang](https://www.linkedin.com/in/jason-huang-342449250/) - Co-Captain and Lead Engineer
  - PCB Design
  - CanSat Structure
- [Tristan Yan-Klassen](https://www.linkedin.com/in/tristan-yan-klassen-510788275/) - Co-Captain and Mission Lead
  - Soil Sample Intake
  - Soil Sample Testing
- [John Xu](https://youtube.com/@ibuildstuff) - Hardware Lead
  - Landing Apparatus
  - Soil Sample Intake
  - Ground Station Hardware
- [Anthony Lu](https://www.linkedin.com/in/anthony-lu-026628241/) - External Communications
  - Outreach
  - Parachute Testing
- Mendel Rieseberg - Ground Control
  - Ground Station Software
  - Radio Communications
  - Microcontroller/PCB Code


### CanSat

The goal of CanSat is to design and build a small satellite that fits inside a 330ml soda can. The satellite will be launched to an altitude of 1km and will be deployed to land safely on the ground. We must equip the satellite with sensors to measure temperature, pressure, altitude, and location.

### This Repository

The project is split into four subdirectories:
- 'backend': The backend server for the ground station
- 'mission-control': The frontend dashboard for the ground station
- 'landing': The landing page for the website
- 'embedded': The Arduino code for the CanSat microcontroller

The embedded code consists of sensors detecting temperature, pressure, altitude, and location. The data is sent to the ground station via radio communication, which is relayed via socket communication to the frontend dashboard. The dashboard then visualizes that information in the form of graphs, a map showing the CanSat's location, and the live 3D rotation of the CanSat.
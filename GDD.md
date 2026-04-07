# Game Design Document: NEO-PANGEA: THE AZANIA CORRIDOR

## 1. Executive Summary
**Title:** NEO-PANGEA: THE AZANIA CORRIDOR  
**Genre:** 3D AAA Open-World Action-Adventure RPG  
**Setting:** 2090 Johannesburg-Cape-City Megalopolis (The Azania Corridor)  
**Platform Targets:** PC, PlayStation 5, Xbox Series X, VR (Headset Mode)  
**Engine:** Unreal Engine 5 (Production) / Three.js (Web Prototype)

## 2. World & Setting
### 2.1 The Azania Corridor (2090)
A hyper-dense urban sprawl connecting Johannesburg and Cape Town. The world features:
- **The High-Rise Districts:** Vertical cities with floating transit and neon-lit skyscrapers.
- **The Savannah-Edge Suburbs:** Where high-tech architecture meets the restored African wilderness.
- **The Underground (The Roots):** A subterranean network of markets, data havens, and forgotten transit tunnels.

### 2.2 Dynamic Systems
- **Day-Night Cycle:** 24-minute real-time cycle affecting NPC behavior and lighting.
- **Dynamic Weather:** From "Dust-Storms" to "Monsoon Rains," affecting visibility and physics (slick roads).

## 3. Gameplay Mechanics
### 3.1 Camera & Control
- **Switchable Perspective:** Seamless toggle between First-Person (immersion) and Third-Person (combat/traversal).
- **Movement:** Parkour-inspired traversal, wall-running, and high-speed hover-vehicle driving.

### 3.2 Combat & Physics
- **Physics-Based Interaction:** Destructible cover, environmental hazards, and realistic vehicle collisions.
- **Combat:** A mix of traditional ballistics and "Bio-Digital" abilities (hacking, kinetic pulses).

### 3.3 Multiplayer
- **Online Co-op:** Up to 4 players in a shared persistent world.
- **Shared Missions:** Dynamic world events that scale based on the number of players.

## 4. Technical Specifications
### 4.1 Graphics Pipeline
- **PBR Materials:** Physically Based Rendering for realistic metal, skin, and fabric.
- **Global Illumination:** Lumen (UE5) or Ray-Traced approximations for realistic light bounce.
- **Post-Processing:** Motion blur, depth of field, and volumetric clouds.

### 4.2 AI Systems
- **NPC Routines:** NPCs have daily cycles (Work -> Social -> Rest).
- **Faction Loyalty:** Player actions affect standing with groups like "The Solar Union" or "The Root Runners."

## 5. Monetization & Live Service
- **Cosmetic Shop:** Non-gameplay-affecting skins inspired by futuristic African fashion (Ankara-Cyber).
- **Battle Pass:** Seasonal "Corridor Passes" with unique lore-based rewards.

## 6. Web Prototype Implementation (Three.js)
The initial prototype demonstrates:
- 3D City Environment with PBR materials.
- Switchable Camera (Orbit/Follow).
- Day-Night Lighting Simulation.
- Basic Player Physics.

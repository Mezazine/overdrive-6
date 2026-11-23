"""
scripts/build_full_catalogs.py
Systematic extraction and compilation of Shadowrun 6 item, vehicle, spell, matrix, and quality catalogs.
"""

import json
import os
import re

OUT_DIR = 'src/engine/specs/catalogs'
os.makedirs(OUT_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. WEAPONS CATALOG
# -------------------------------------------------------------
weapons = {
    # Blades / Klingen
    "Kampfaxt": {
        "category": "Nahkampf (Klingen)",
        "damage": "5K",
        "attack_ratings": [9, None, None, None, None],
        "availability": "4",
        "cost": 500,
        "source": "GRW S. 250"
    },
    "Kampfmesser": {
        "category": "Nahkampf (Klingen)",
        "damage": "3K",
        "attack_ratings": [8, 2, None, None, None],
        "availability": "2",
        "cost": 220,
        "source": "GRW S. 250"
    },
    "Katana": {
        "category": "Nahkampf (Klingen)",
        "damage": "4K",
        "attack_ratings": [10, None, None, None, None],
        "availability": "3",
        "cost": 350,
        "source": "GRW S. 250"
    },
    "Messer": {
        "category": "Nahkampf (Klingen)",
        "damage": "2K",
        "attack_ratings": [6, 1, None, None, None],
        "availability": "1",
        "cost": 20,
        "source": "GRW S. 250"
    },
    "Schwert": {
        "category": "Nahkampf (Klingen)",
        "damage": "3K",
        "attack_ratings": [9, None, None, None, None],
        "availability": "3",
        "cost": 320,
        "source": "GRW S. 250"
    },
    "Stangenwaffe": {
        "category": "Nahkampf (Klingen)",
        "damage": "4K",
        "attack_ratings": [8, None, None, None, None],
        "availability": "2",
        "cost": 210,
        "source": "GRW S. 250"
    },
    "Überlebensmesser": {
        "category": "Nahkampf (Klingen)",
        "damage": "3K",
        "attack_ratings": [8, 2, None, None, None],
        "availability": "2",
        "cost": 220,
        "source": "GRW S. 250"
    },
    "Unterarmschnappklingen": {
        "category": "Nahkampf (Klingen)",
        "damage": "3K",
        "attack_ratings": [6, None, None, None, None],
        "availability": "3",
        "cost": 185,
        "source": "GRW S. 250"
    },
    # Clubs / Knüppel
    "Betäubungsschlagstock": {
        "category": "Nahkampf (Knüppel)",
        "damage": "5B(e)",
        "attack_ratings": [6, None, None, None, None],
        "availability": "2",
        "cost": 600,
        "source": "GRW S. 250"
    },
    "Knüppel": {
        "category": "Nahkampf (Knüppel)",
        "damage": "3B",
        "attack_ratings": [6, None, None, None, None],
        "availability": "1",
        "cost": 65,
        "source": "GRW S. 250"
    },
    "Schlagstock": {
        "category": "Nahkampf (Knüppel)",
        "damage": "3B",
        "attack_ratings": [8, None, None, None, None],
        "availability": "1",
        "cost": 150,
        "source": "GRW S. 250"
    },
    "Totschläger": {
        "category": "Nahkampf (Knüppel)",
        "damage": "2B",
        "attack_ratings": [5, None, None, None, None],
        "availability": "1",
        "cost": 50,
        "source": "GRW S. 250"
    },
    "Vorschlaghammer": {
        "category": "Nahkampf (Knüppel)",
        "damage": "4B",
        "attack_ratings": [8, None, None, None, None],
        "availability": "1",
        "cost": 250,
        "source": "GRW S. 250"
    },
    "W Teleskopschlagstock": {
        "category": "Nahkampf (Knüppel)",
        "damage": "2B",
        "attack_ratings": [6, None, None, None, None],
        "availability": "1",
        "cost": 75,
        "source": "GRW S. 250"
    },
    # Exotisch
    "Monofilamentpeitsche": {
        "category": "Exotische Waffen",
        "damage": "4K",
        "attack_ratings": [14, None, None, None, None],
        "availability": "6I",
        "cost": 1300,
        "source": "GRW S. 251"
    },
    # Projektil- und Wurfwaffen
    "Bogen": {
        "category": "Projektilwaffen",
        "damage": "Stufe/2 K",
        "attack_ratings": ["varies", "varies", "varies", None, None],
        "availability": "2",
        "cost": "Stufe * 100",
        "source": "GRW S. 251"
    },
    "Armbrust": {
        "category": "Projektilwaffen",
        "damage": "3K",
        "attack_ratings": [2, 10, 4, 2, None],
        "availability": "2",
        "cost": 290,
        "source": "GRW S. 251"
    },
    "Schwere Armbrust": {
        "category": "Projektilwaffen",
        "damage": "4K",
        "attack_ratings": [2, 8, 6, 4, None],
        "availability": "3",
        "cost": 425,
        "source": "GRW S. 251"
    },
    "Wurfmesser": {
        "category": "Wurfwaffen",
        "damage": "1K",
        "attack_ratings": [9, 11, 5, None, None],
        "availability": "1",
        "cost": 25,
        "source": "GRW S. 251"
    },
    "Shuriken": {
        "category": "Wurfwaffen",
        "damage": "1K",
        "attack_ratings": [10, 9, 3, None, None],
        "availability": "1",
        "cost": 25,
        "source": "GRW S. 251"
    },
    # Taschenpistolen
    "Streetline Special": {
        "category": "Taschenpistolen",
        "damage": "2K",
        "modes": ["HM"],
        "attack_ratings": [10, 7, 6, None, None],
        "ammo_capacity": 6,
        "ammo_feed": "s",
        "availability": "1",
        "cost": 260,
        "source": "GRW S. 253"
    },
    "Walther Palm Pistol": {
        "category": "Taschenpistolen",
        "damage": "2K",
        "modes": ["EM", "HM"],
        "attack_ratings": [10, 9, 6, None, None],
        "ammo_capacity": 2,
        "ammo_feed": "k",
        "availability": "2",
        "cost": 230,
        "source": "GRW S. 253"
    },
    # Leichte Pistolen
    "Beretta 2010": {
        "category": "Leichte Pistolen",
        "damage": "2K",
        "modes": ["HM", "SM"],
        "attack_ratings": [7, 10, 7, None, None],
        "ammo_capacity": 17,
        "ammo_feed": "s",
        "availability": "2",
        "cost": 250,
        "source": "GRW S. 253"
    },
    "Colt America L36": {
        "category": "Leichte Pistolen",
        "damage": "2K",
        "modes": ["HM"],
        "attack_ratings": [10, 7, 6, None, None],
        "ammo_capacity": 11,
        "ammo_feed": "s",
        "availability": "1",
        "cost": 350,
        "source": "GRW S. 253"
    },
    "Fichetti Security 600": {
        "category": "Leichte Pistolen",
        "damage": "2K",
        "modes": ["HM", "SM"],
        "attack_ratings": [10, 7, 6, None, None],
        "ammo_capacity": 30,
        "ammo_feed": "s",
        "availability": "2",
        "cost": 400,
        "source": "GRW S. 253"
    },
    # Schwere Pistolen
    "Ares Predator VI": {
        "category": "Schwere Pistolen",
        "damage": "3K",
        "modes": ["HM", "SM"],
        "attack_ratings": [10, 10, 8, None, None],
        "ammo_capacity": 15,
        "ammo_feed": "s",
        "availability": "2L",
        "cost": 750,
        "accessories": ["Smartgunsystem (intern)"],
        "source": "GRW S. 255"
    },
    "Ares Viper Slivergun": {
        "category": "Schwere Pistolen",
        "damage": "3K",
        "modes": ["HM", "SM"],
        "attack_ratings": [12, 8, 6, None, None],
        "ammo_capacity": 30,
        "ammo_feed": "s",
        "availability": "4L",
        "cost": 610,
        "source": "GRW S. 255"
    },
    "Browning Ultra Power": {
        "category": "Schwere Pistolen",
        "damage": "3K",
        "modes": ["HM"],
        "attack_ratings": [10, 9, 6, None, None],
        "ammo_capacity": 10,
        "ammo_feed": "s",
        "availability": "2L",
        "cost": 315,
        "source": "GRW S. 255"
    },
    "Colt Government 2076": {
        "category": "Schwere Pistolen",
        "damage": "3K",
        "modes": ["HM"],
        "attack_ratings": [10, 8, 6, None, None],
        "ammo_capacity": 14,
        "ammo_feed": "s",
        "availability": "3L",
        "cost": 275,
        "source": "GRW S. 255"
    },
    "Colt Manhunter": {
        "category": "Schwere Pistolen",
        "damage": "3K",
        "modes": ["HM"],
        "attack_ratings": [11, 9, 7, None, None],
        "ammo_capacity": 14,
        "ammo_feed": "s",
        "availability": "3L",
        "cost": 500,
        "source": "GRW S. 255"
    },
    "Ruger Super Warhawk": {
        "category": "Schwere Pistolen",
        "damage": "4K",
        "modes": ["HM"],
        "attack_ratings": [8, 11, 8, None, None],
        "ammo_capacity": 6,
        "ammo_feed": "tr",
        "availability": "3L",
        "cost": 400,
        "source": "GRW S. 255"
    },
    # Maschinenpistolen
    "Ceska Black Scorpion": {
        "category": "Maschinenpistolen",
        "damage": "3K",
        "modes": ["HM", "SM"],
        "attack_ratings": [10, 9, 6, None, None],
        "ammo_capacity": 35,
        "ammo_feed": "s",
        "availability": "3L",
        "cost": 325,
        "source": "GRW S. 256"
    },
    "Colt Cobra TZ-120": {
        "category": "Maschinenpistolen",
        "damage": "3K",
        "modes": ["HM", "SM"],
        "attack_ratings": [9, 9, 6, None, None],
        "ammo_capacity": 30,
        "ammo_feed": "s",
        "availability": "3L",
        "cost": 730,
        "source": "GRW S. 256"
    },
    "FN P93 Praetor": {
        "category": "Maschinenpistolen",
        "damage": "3K",
        "modes": ["HM", "SM"],
        "attack_ratings": [10, 10, 7, None, None],
        "ammo_capacity": 50,
        "ammo_feed": "s",
        "availability": "4L",
        "cost": 785,
        "source": "GRW S. 256"
    },
    "HK-227": {
        "category": "Maschinenpistolen",
        "damage": "3K",
        "modes": ["HM", "SM"],
        "attack_ratings": [10, 10, 7, None, None],
        "ammo_capacity": 28,
        "ammo_feed": "s",
        "availability": "3L",
        "cost": 840,
        "source": "GRW S. 256"
    },
    "SCK Modell 100": {
        "category": "Maschinenpistolen",
        "damage": "3K",
        "modes": ["HM", "SM"],
        "attack_ratings": [10, 11, 8, None, None],
        "ammo_capacity": 30,
        "ammo_feed": "s",
        "availability": "3L",
        "cost": 825,
        "source": "GRW S. 256"
    },
    "Uzi IV": {
        "category": "Maschinenpistolen",
        "damage": "3K",
        "modes": ["HM", "SM"],
        "attack_ratings": [11, 9, 6, None, None],
        "ammo_capacity": 24,
        "ammo_feed": "s",
        "availability": "3L",
        "cost": 750,
        "source": "GRW S. 256"
    },
    # Schrotflinten
    "Defiance T-250": {
        "category": "Schrotflinten",
        "damage": "4K",
        "modes": ["EM", "HM"],
        "attack_ratings": [7, 10, 6, None, None],
        "ammo_capacity": 5,
        "ammo_feed": "m",
        "availability": "2L",
        "cost": 330,
        "source": "GRW S. 256"
    },
    "Enfield AS-7": {
        "category": "Schrotflinten",
        "damage": "4K",
        "modes": ["HM", "SM"],
        "attack_ratings": [4, 11, 7, None, None],
        "ammo_capacity": 10,
        "ammo_feed": "s",
        "availability": "4L",
        "cost": 700,
        "source": "GRW S. 256"
    },
    "Mossberg CMDT": {
        "category": "Schrotflinten",
        "damage": "4K",
        "modes": ["HM", "SM"],
        "attack_ratings": [5, 12, 8, None, None],
        "ammo_capacity": 24,
        "ammo_feed": "tr",
        "availability": "4L",
        "cost": 825,
        "source": "GRW S. 256"
    },
    # Sturmgewehre
    "AK-97": {
        "category": "Sturmgewehre",
        "damage": "5K",
        "modes": ["HM", "SM", "AM"],
        "attack_ratings": [2, 11, 12, 7, 3],
        "ammo_capacity": 38,
        "ammo_feed": "s",
        "availability": "3L",
        "cost": 1750,
        "source": "GRW S. 258"
    },
    "Ares Alpha": {
        "category": "Sturmgewehre",
        "damage": "5K",
        "modes": ["HM", "SM", "AM"],
        "attack_ratings": [1, 10, 12, 8, 7],
        "ammo_capacity": 42,
        "ammo_feed": "s",
        "availability": "5L",
        "cost": 4175,
        "accessories": ["Smartgunsystem (intern)", "Unterlauf-Granatwerfer"],
        "source": "GRW S. 258"
    },
    "Colt M23": {
        "category": "Sturmgewehre",
        "damage": "5K",
        "modes": ["HM", "SM", "AM"],
        "attack_ratings": [1, 10, 11, 7, 6],
        "ammo_capacity": 40,
        "ammo_feed": "s",
        "availability": "3L",
        "cost": 1400,
        "source": "GRW S. 258"
    },
    "FN HAR": {
        "category": "Sturmgewehre",
        "damage": "5K",
        "modes": ["HM", "SM", "AM"],
        "attack_ratings": [1, 9, 12, 8, 6],
        "ammo_capacity": 35,
        "ammo_feed": "s",
        "availability": "4L",
        "cost": 1600,
        "source": "GRW S. 258"
    },
    # Scharfschützengewehre
    "Ares Desert Strike": {
        "category": "Scharfschützengewehre",
        "damage": "5K",
        "modes": ["HM"],
        "attack_ratings": [3, 10, 10, 10, 10],
        "ammo_capacity": 14,
        "ammo_feed": "s",
        "availability": "5L",
        "cost": 11000,
        "source": "GRW S. 258"
    },
    "Barret Modell 122": {
        "category": "Scharfschützengewehre",
        "damage": "6K",
        "modes": ["HM"],
        "attack_ratings": [1, 8, 11, 16, 14],
        "ammo_capacity": 14,
        "ammo_feed": "s",
        "availability": "6I",
        "cost": 15200,
        "source": "GRW S. 258"
    },
    "Cavalier Arms Crockett EBR": {
        "category": "Scharfschützengewehre",
        "damage": "5K",
        "modes": ["HM", "SM"],
        "attack_ratings": [3, 8, 11, 8, 8],
        "ammo_capacity": 20,
        "ammo_feed": "s",
        "availability": "4L",
        "cost": 9050,
        "source": "GRW S. 258"
    },
    "Ruger 101": {
        "category": "Scharfschützengewehre",
        "damage": "5K",
        "modes": ["HM"],
        "attack_ratings": [3, 6, 9, 11, 12],
        "ammo_capacity": 8,
        "ammo_feed": "s",
        "availability": "3L",
        "cost": 13200,
        "source": "GRW S. 258"
    },
    # Maschinengewehre & schwere Waffen
    "Ingram Valiant (LMG)": {
        "category": "Leichtes Maschinengewehr",
        "damage": "5K",
        "modes": ["SM", "AM"],
        "attack_ratings": [1, 9, 12, 8, 6],
        "ammo_capacity": 50,
        "ammo_feed": "g",
        "availability": "5L",
        "cost": 4175,
        "source": "GRW S. 259"
    },
    "Ares HVAR": {
        "category": "Sturmgewehr / Schnellfeuer",
        "damage": "4K",
        "modes": ["SM", "AM"],
        "attack_ratings": [1, 10, 12, 7, 3],
        "ammo_capacity": 50,
        "ammo_feed": "s",
        "availability": "4L",
        "cost": 3200,
        "source": "GRW S. 259"
    },
    "Panther XXL": {
        "category": "Sturmkanone",
        "damage": "7K",
        "modes": ["HM"],
        "attack_ratings": [None, 6, 8, 6, 5],
        "ammo_capacity": 15,
        "ammo_feed": "s",
        "availability": "6I",
        "cost": 5900,
        "source": "GRW S. 260"
    },
    "ArmTech MGL-6": {
        "category": "Granatwerfer",
        "damage": "wie Granate",
        "modes": ["HM"],
        "attack_ratings": [None, 8, 8, 3, None],
        "ammo_capacity": 6,
        "ammo_feed": "tr",
        "availability": "5L",
        "cost": 1800,
        "source": "GRW S. 260"
    },
    "ArmTech MGL-12": {
        "category": "Granatwerfer",
        "damage": "wie Granate",
        "modes": ["HM"],
        "attack_ratings": [None, 8, 9, 6, 2],
        "ammo_capacity": 12,
        "ammo_feed": "tr",
        "availability": "6L",
        "cost": 5000,
        "source": "GRW S. 260"
    },
    "Ares Antioch-2": {
        "category": "Granatwerfer",
        "damage": "wie Granate",
        "modes": ["HM"],
        "attack_ratings": [None, 4, 10, 9, 6],
        "ammo_capacity": 8,
        "ammo_feed": "tr",
        "availability": "5L",
        "cost": 7000,
        "source": "GRW S. 260"
    },
    "Aztechnology Striker": {
        "category": "Raketenwerfer (Einweg)",
        "damage": "wie Rakete",
        "modes": ["EM"],
        "attack_ratings": [None, 5, 9, 10, 8],
        "ammo_capacity": 1,
        "ammo_feed": "k",
        "availability": "6I",
        "cost": 9000,
        "source": "GRW S. 260"
    }
}

with open(f'{OUT_DIR}/weapons.json', 'w', encoding='utf-8') as f:
    json.dump(weapons, f, indent=2, ensure_ascii=False)

# -------------------------------------------------------------
# 2. AMMUNITION & ACCESSORIES
# -------------------------------------------------------------
ammo_accessories = {
    "ammunition": {
        "Standard": {"ar_mod": 0, "damage_mod": 0, "availability": "1", "cost_per_10": 20, "description": "Normale Standardgeschosse"},
        "APDS (Panzerbrechend)": {"ar_mod": 2, "damage_mod": 0, "availability": "4L", "cost_per_10": 120, "description": "Penetriert Rüstung besser, gewährt +2 Angriffswert"},
        "Explosivmunition": {"ar_mod": 0, "damage_mod": 1, "availability": "3L", "cost_per_10": 80, "description": "Explodiert beim Aufprall, +1 Schadenswert"},
        "Gelmunition": {"ar_mod": 0, "damage_mod": 0, "stun": True, "availability": "1", "cost_per_10": 25, "description": "Nicht-tödlich, verursacht Betäubungsschaden (B)"},
        "Flechettemunition": {"ar_mod": -2, "damage_mod": 1, "availability": "2", "cost_per_10": 60, "description": "+1 Schaden auf kurze Distanz, aber -2 Angriffswert"},
        "Schockermunition": {"ar_mod": 0, "damage_mod": 0, "special": "5B(e)", "availability": "2", "cost_per_10": 100, "description": "Elektrischer Schaden, verursacht Status Verwirrt/Betäubt"}
    },
    "accessories": {
        "Smartgunsystem (extern)": {"cost": 200, "avail": "2", "effects": "+2 Angriffswert, +1 Würfel WiFi"},
        "Smartgunsystem (intern)": {"cost": 500, "avail": "3L", "effects": "+2 Angriffswert, +2 Würfel WiFi mit implantiertem Smartlink"},
        "Gasventilsystem 2": {"cost": 200, "avail": "2", "effects": "Kompensiert 2 Punkte Rückstoß"},
        "Gasventilsystem 3": {"cost": 400, "avail": "3", "effects": "Kompensiert 3 Punkte Rückstoß"},
        "Schalldämpfer": {"cost": 150, "avail": "2", "effects": "Erhöht Wahrnehmungsschwelle zum Hören der Waffe um 2"},
        "Lasermarkierer": {"cost": 100, "avail": "2", "effects": "+1 Angriffswert auf nahe Distanzen"},
        "Zielfernrohr": {"cost": 150, "avail": "2", "effects": "Verringert Distanzmodifikatoren auf weite und extreme Entfernungen"}
    }
}
with open(f'{OUT_DIR}/ammunition_accessories.json', 'w', encoding='utf-8') as f:
    json.dump(ammo_accessories, f, indent=2, ensure_ascii=False)

# -------------------------------------------------------------
# 3. ARMOR CATALOG
# -------------------------------------------------------------
armor = {
    "Kleidung": {"defense_rating": 0, "capacity": 0, "avail": "1", "cost": 50, "source": "GRW S. 265"},
    "Kunstlederjacke": {"defense_rating": 1, "capacity": 3, "avail": "1", "cost": 300, "source": "GRW S. 267"},
    "Panzerkleidung": {"defense_rating": 2, "capacity": 4, "avail": "2", "cost": 500, "source": "GRW S. 267"},
    "Actioneer Geschäftsanzug": {"defense_rating": 2, "capacity": 6, "avail": "2", "cost": 1500, "source": "GRW S. 267"},
    "Chamäleonanzug": {"defense_rating": 2, "capacity": 4, "avail": "4I", "cost": 2000, "source": "GRW S. 267"},
    "Panzerweste": {"defense_rating": 3, "capacity": 6, "avail": "2", "cost": 750, "source": "GRW S. 267"},
    "Gefütterter Mantel": {"defense_rating": 3, "capacity": 7, "avail": "2", "cost": 900, "source": "GRW S. 267"},
    "Panzerjacke": {"defense_rating": 4, "capacity": 8, "avail": "2", "cost": 1000, "source": "GRW S. 267"},
    "Ganzkörperpanzerung": {"defense_rating": 5, "capacity": 10, "avail": "4L", "cost": 2000, "source": "GRW S. 267"},
    "Helm (Ganzkörperpanzerung)": {"defense_rating": 2, "capacity": 6, "avail": "2", "cost": 500, "notes": "Zählt zusätzlich zur Ganzkörperpanzerung", "source": "GRW S. 267"}
}
with open(f'{OUT_DIR}/armor.json', 'w', encoding='utf-8') as f:
    json.dump(armor, f, indent=2, ensure_ascii=False)

# -------------------------------------------------------------
# 4. FULL VEHICLES & DRONES CATALOG
# -------------------------------------------------------------
vehicles_drones = {
    "Motorräder": {
        "Dodge Scoot": {"handling": {"road": 5, "offroad": 7}, "accel": 4, "interval": 10, "top_speed": 80, "body": 2, "armor": 0, "pilot": 1, "sensor": 0, "seats": 2, "avail": "2", "cost": 3000},
        "Harley-Davidson Scorpion": {"handling": {"road": 3, "offroad": 5}, "accel": 16, "interval": 30, "top_speed": 200, "body": 7, "armor": 6, "pilot": 1, "sensor": 1, "seats": 2, "avail": "2", "cost": 14000},
        "Yamaha Growler": {"handling": {"road": 3, "offroad": 3}, "accel": 15, "interval": 20, "top_speed": 180, "body": 6, "armor": 4, "pilot": 1, "sensor": 1, "seats": 2, "avail": "2", "cost": 8000},
        "Suzuki Mirage": {"handling": {"road": 2, "offroad": 6}, "accel": 29, "interval": 30, "top_speed": 260, "body": 4, "armor": 2, "pilot": 1, "sensor": 1, "seats": 1, "avail": "2", "cost": 12000}
    },
    "Autos": {
        "Chrysler-Nissan Jackrabbit": {"handling": {"road": 3, "offroad": 5}, "accel": 20, "interval": 15, "top_speed": 160, "body": 8, "armor": 4, "pilot": 2, "sensor": 1, "seats": 3, "avail": "2", "cost": 11000},
        "Honda Spirit": {"handling": {"road": 4, "offroad": 5}, "accel": 15, "interval": 20, "top_speed": 150, "body": 10, "armor": 3, "pilot": 1, "sensor": 1, "seats": 2, "avail": "2", "cost": 13000},
        "Eurocar Westwind X80": {"handling": {"road": 2, "offroad": 6}, "accel": 24, "interval": 30, "top_speed": 250, "body": 6, "armor": 1, "pilot": 4, "sensor": 3, "seats": 2, "avail": "3", "cost": 115000},
        "Hyundai Shin-Hyung": {"handling": {"road": 3, "offroad": 5}, "accel": 12, "interval": 25, "top_speed": 200, "body": 7, "armor": 1, "pilot": 1, "sensor": 1, "seats": 3, "avail": "2", "cost": 20000},
        "Ford Americar": {"handling": {"road": 4, "offroad": 5}, "accel": 9, "interval": 20, "top_speed": 160, "body": 11, "armor": 4, "pilot": 1, "sensor": 2, "seats": 4, "avail": "2", "cost": 16000},
        "Saeder-Krupp-Bentley Concordat": {"handling": {"road": 3, "offroad": 5}, "accel": 18, "interval": 30, "top_speed": 180, "body": 14, "armor": 8, "pilot": 3, "sensor": 3, "seats": 4, "avail": "3", "cost": 65000},
        "Mitsubishi Nightsky": {"handling": {"road": 4, "offroad": 6}, "accel": 10, "interval": 10, "top_speed": 160, "body": 18, "armor": 10, "pilot": 3, "sensor": 4, "seats": 8, "avail": "3", "cost": 259000}
    },
    "Lkw_und_Vans": {
        "Toyota Gopher": {"handling": {"road": 4, "offroad": 4}, "accel": 15, "interval": 15, "top_speed": 150, "body": 12, "armor": 6, "pilot": 1, "sensor": 1, "seats": 4, "avail": "2", "cost": 25000},
        "GMC Bulldog": {"handling": {"road": 5, "offroad": 7}, "accel": 10, "interval": 10, "top_speed": 140, "body": 16, "armor": 12, "pilot": 2, "sensor": 3, "seats": 10, "avail": "2", "cost": 35000},
        "Range Rover Model 2080": {"handling": {"road": 4, "offroad": 5}, "accel": 12, "interval": 20, "top_speed": 160, "body": 16, "armor": 10, "pilot": 4, "sensor": 4, "seats": 7, "avail": "3", "cost": 73000},
        "Ares Roadmaster": {"handling": {"road": 5, "offroad": 7}, "accel": 8, "interval": 10, "top_speed": 120, "body": 18, "armor": 16, "pilot": 2, "sensor": 2, "seats": 12, "avail": "2", "cost": 68000}
    },
    "Boote_und_Uboote": {
        "Samuvani-Criscraft Otter": {"handling": 4, "accel": 10, "interval": 15, "top_speed": 90, "body": 6, "armor": 4, "pilot": 2, "sensor": 2, "seats": 6, "avail": "2", "cost": 25000},
        "Aztechnology Sunrunner/Nightrunner": {"handling": 3, "accel": 20, "interval": 20, "top_speed": 120, "body": 10, "armor": 8, "pilot": 3, "sensor": 3, "seats": 5, "avail": "3", "cost": 39000},
        "GMC Riverine": {"handling": 4, "accel": 15, "interval": 15, "top_speed": 100, "body": 14, "armor": 12, "pilot": 4, "sensor": 4, "seats": 8, "avail": "4", "cost": 113000},
        "Proteus Lamprey (U-Boot)": {"handling": 3, "accel": 13, "interval": 10, "top_speed": 60, "body": 2, "armor": 1, "pilot": 2, "sensor": 1, "seats": 4, "avail": "4", "cost": 15000}
    },
    "Mikrodrohnen": {
        "GMC Micromachine": {"handling": {"road": 3, "offroad": 6}, "accel": 5, "interval": 5, "top_speed": 25, "body": 0, "armor": 0, "pilot": 1, "sensor": 1, "avail": "2", "cost": 450},
        "Shiawase Kanmushi": {"handling": {"road": 2, "offroad": 3}, "accel": 4, "interval": 5, "top_speed": 15, "body": 0, "armor": 0, "pilot": 3, "sensor": 2, "avail": "2", "cost": 900},
        "Sikorsky-Bell Microskimmer XXS": {"handling": 2, "accel": 6, "interval": 10, "top_speed": 35, "body": 0, "armor": 0, "pilot": 2, "sensor": 1, "avail": "2", "cost": 850},
        "MCT Gnat": {"handling": 3, "accel": 4, "interval": 10, "top_speed": 30, "body": 0, "armor": 0, "pilot": 2, "sensor": 1, "avail": "2", "cost": 800}
    },
    "Minidrohnen": {
        "GM-Nissan Flip-Flop": {"handling": {"road": 2, "offroad": 4}, "accel": 8, "interval": 15, "top_speed": 50, "body": 1, "armor": 0, "pilot": 2, "sensor": 1, "avail": "2", "cost": 1000},
        "Shiawase Inu": {"handling": {"road": 2, "offroad": 3}, "accel": 6, "interval": 8, "top_speed": 24, "body": 1, "armor": 0, "pilot": 2, "sensor": 2, "avail": "2", "cost": 1100},
        "Horizon Flying Eye": {"handling": 3, "accel": 15, "interval": 15, "top_speed": 40, "body": 1, "armor": 0, "pilot": 2, "sensor": 2, "avail": "2", "cost": 2000},
        "MCT Hornet": {"handling": 3, "accel": 20, "interval": 15, "top_speed": 35, "body": 1, "armor": 0, "pilot": 2, "sensor": 2, "avail": "2", "cost": 2100}
    },
    "Kleine_Drohnen": {
        "Chrysler-Nissan Pursuit V": {"handling": {"road": 3, "offroad": 6}, "accel": 30, "interval": 50, "top_speed": 280, "body": 4, "armor": 2, "pilot": 4, "sensor": 3, "avail": "3", "cost": 11000},
        "Aztechnology Crawler": {"handling": {"road": 3, "offroad": 4}, "accel": 8, "interval": 10, "top_speed": 30, "body": 6, "armor": 2, "pilot": 2, "sensor": 2, "avail": "2", "cost": 4500},
        "Cyberspace Designs Quadrotor": {"handling": 2, "accel": 15, "interval": 20, "top_speed": 120, "body": 3, "armor": 1, "pilot": 3, "sensor": 2, "avail": "2", "cost": 5000},
        "Lockheed Optic-X2": {"handling": 4, "accel": 15, "interval": 30, "top_speed": 140, "body": 2, "armor": 4, "pilot": 4, "sensor": 4, "avail": "3", "cost": 18000}
    },
    "Mittlere_Drohnen": {
        "GM-Nissan Dobermann": {"handling": {"road": 3, "offroad": 5}, "accel": 10, "interval": 15, "top_speed": 100, "body": 4, "armor": 6, "pilot": 2, "sensor": 3, "avail": "2", "cost": 6500},
        "Nissan Samurai": {"handling": {"road": 3, "offroad": 4}, "accel": 10, "interval": 10, "top_speed": 30, "body": 6, "armor": 6, "pilot": 3, "sensor": 2, "avail": "2", "cost": 4500},
        "MCT-Nissan Roto-Drohne": {"handling": 3, "accel": 20, "interval": 30, "top_speed": 160, "body": 5, "armor": 6, "pilot": 3, "sensor": 2, "avail": "2", "cost": 5000},
        "Federated-Boeing Blackhawk": {"handling": 3, "accel": 35, "interval": 40, "top_speed": 200, "body": 8, "armor": 6, "pilot": 3, "sensor": 3, "avail": "3", "cost": 8000}
    },
    "Grosse_Drohnen": {
        "Steel Lynx": {"handling": {"road": 3, "offroad": 5}, "accel": 15, "interval": 15, "top_speed": 80, "body": 12, "armor": 16, "pilot": 4, "sensor": 4, "avail": "4", "cost": 25000},
        "Ares Packmule": {"handling": {"road": 3, "offroad": 4}, "accel": 6, "interval": 5, "top_speed": 30, "body": 8, "armor": 6, "pilot": 2, "sensor": 1, "avail": "3", "cost": 10000},
        "Nissan Oni": {"handling": {"road": 3, "offroad": 4}, "accel": 10, "interval": 8, "top_speed": 30, "body": 9, "armor": 10, "pilot": 3, "sensor": 2, "avail": "2", "cost": 6700},
        "Cyberspace Designs Dalmatian": {"handling": 3, "accel": 13, "interval": 20, "top_speed": 130, "body": 6, "armor": 4, "pilot": 3, "sensor": 3, "avail": "3", "cost": 10000},
        "Ares Black Sky": {"handling": 2, "accel": 25, "interval": 50, "top_speed": 300, "body": 8, "armor": 10, "pilot": 4, "sensor": 4, "avail": "5", "cost": 43000}
    }
}
with open(f'{OUT_DIR}/vehicles_drones.json', 'w', encoding='utf-8') as f:
    json.dump(vehicles_drones, f, indent=2, ensure_ascii=False)

# -------------------------------------------------------------
# 5. BODYTECH CATALOG (Cyberware & Bioware)
# -------------------------------------------------------------
bodytech = {
    "Headware": {
        "Kommlink (Kopfeinbau)": {"essence": 0.2, "capacity": 2, "avail": "2", "cost": 2000, "note": "+ Kommlink-Kaufpreis"},
        "Cyberdeck (Kopfeinbau)": {"essence": 0.4, "capacity": 4, "avail": "4I", "cost": 5000, "note": "+ Cyberdeck-Kaufpreis"},
        "Datenbuchse": {"essence": 0.1, "capacity": 0, "avail": "2", "cost": 1000},
        "Riggerkontrolle 1": {"essence": 1.0, "capacity": 0, "avail": "4L", "cost": 30000},
        "Riggerkontrolle 2": {"essence": 2.0, "capacity": 0, "avail": "4L", "cost": 60000},
        "Riggerkontrolle 3": {"essence": 3.0, "capacity": 0, "avail": "4L", "cost": 90000},
        "Talentbuchse (Stufe 1-6)": {"essence": 0.1, "capacity": 0, "avail": "4", "cost_multiplier": 1000},
        "Geruchsbooster (Stufe 1-3)": {"essence": 0.2, "capacity": 0, "avail": "3", "cost_multiplier": 4000},
        "Geschmacksbooster (Stufe 1-3)": {"essence": 0.2, "capacity": 0, "avail": "3", "cost_multiplier": 3000},
        "Stimmenmodulator (Stufe 1-3)": {"essence": 0.2, "capacity": 0, "avail": "4L", "cost_multiplier": 5000}
    },
    "Eyeware": {
        "Cyberaugen 1": {"essence": 0.1, "capacity": 1, "avail": "2", "cost": 1000},
        "Cyberaugen 2": {"essence": 0.2, "capacity": 4, "avail": "2", "cost": 4000},
        "Cyberaugen 3": {"essence": 0.3, "capacity": 8, "avail": "3", "cost": 6000},
        "Cyberaugen 4": {"essence": 0.4, "capacity": 12, "avail": "3", "cost": 10000},
        "Cyberaugen 5": {"essence": 0.5, "capacity": 16, "avail": "3", "cost": 16000},
        "Smartlink": {"essence": 0.2, "capacity_in_eyes": 3, "avail": "3L", "cost": 4000},
        "Bildverbindung": {"essence": 0.1, "capacity_in_eyes": 0, "avail": "2", "cost": 800},
        "Blitzkompensation": {"essence": 0.1, "capacity_in_eyes": 1, "avail": "2", "cost": 1000},
        "Infrarotsicht": {"essence": 0.1, "capacity_in_eyes": 2, "avail": "2", "cost": 2000},
        "Restlichtverstärkung": {"essence": 0.1, "capacity_in_eyes": 2, "avail": "2", "cost": 1500},
        "Sichtverbesserung": {"essence": 0.1, "capacity_in_eyes": 2, "avail": "3", "cost": 4000},
        "Sichtvergrößerung": {"essence": 0.1, "capacity_in_eyes": 2, "avail": "3", "cost": 2000}
    },
    "Earware": {
        "Cyberohren 1": {"essence": 0.1, "capacity": 1, "avail": "2", "cost": 1000},
        "Cyberohren 2": {"essence": 0.2, "capacity": 4, "avail": "2", "cost": 3000},
        "Cyberohren 3": {"essence": 0.3, "capacity": 8, "avail": "3", "cost": 4500},
        "Audioverbesserung": {"essence": 0.1, "capacity_in_ears": 1, "avail": "2", "cost": 4000},
        "Dämpfer": {"essence": 0.1, "capacity_in_ears": 1, "avail": "2", "cost": 2250},
        "Balanceverstärker": {"essence": 0.1, "capacity_in_ears": 4, "avail": "3", "cost": 8000}
    },
    "Bodyware": {
        "Dermalpanzerung (Stufe 1-6)": {"essence_per_rating": 0.5, "avail": "3L", "cost_per_rating": 3000, "effect": "+1 Verteidigungswert je Stufe"},
        "Reflexbooster 1": {"essence": 1.0, "avail": "4L", "cost": 40000, "effect": "+1 Reaktion, +1W6 Initiative, +1 Nebenhandlung"},
        "Reflexbooster 2": {"essence": 2.0, "avail": "5L", "cost": 90000, "effect": "+2 Reaktion, +2W6 Initiative, +2 Nebenhandlungen"},
        "Reflexbooster 3": {"essence": 3.0, "avail": "6I", "cost": 150000, "effect": "+3 Reaktion, +3W6 Initiative, +3 Nebenhandlungen"},
        "Kompositknochen (Aluminium)": {"essence": 0.5, "avail": "3L", "cost": 12000, "effect": "+2 Verteidigungswert, Nahkampfschaden 3K"},
        "Interner Lufttank": {"essence": 0.25, "avail": "2", "cost": 2000}
    },
    "Bioware": {
        "Schlafregulator": {"essence": 0.1, "avail": "2", "cost": 12000, "effect": "Nur 3 Stunden Schlaf nötig"},
        "Orthoskin (Stufe 1-4)": {"essence_per_rating": 0.25, "avail": "3L", "cost_per_rating": 6000, "effect": "+1 Verteidigungswert je Stufe"},
        "Muskelstraffung (Stufe 1-4)": {"essence_per_rating": 0.2, "avail": "4L", "cost_per_rating": 15000, "effect": "+1 Geschicklichkeit je Stufe"},
        "Muskelverstärkung (Stufe 1-4)": {"essence_per_rating": 0.2, "avail": "4L", "cost_per_rating": 15000, "effect": "+1 Stärke je Stufe"},
        "Synapsenbeschleuniger 1": {"essence": 0.5, "avail": "5L", "cost": 95000, "effect": "+1 Reaktion, +1W6 Initiative"},
        "Synapsenbeschleuniger 2": {"essence": 1.0, "avail": "6L", "cost": 190000, "effect": "+2 Reaktion, +2W6 Initiative"},
        "Thrombozytenfabrik": {"essence": 0.2, "avail": "3L", "cost": 17000, "effect": "Senkt erlittenen körperlichen Schaden um 1"}
    }
}
with open(f'{OUT_DIR}/bodytech.json', 'w', encoding='utf-8') as f:
    json.dump(bodytech, f, indent=2, ensure_ascii=False)

# -------------------------------------------------------------
# 6. ELECTRONICS & SOFTWARE
# -------------------------------------------------------------
elec_software = {
    "Commlinks": {
        "Meta Link": {"device_rating": 1, "data_processing": 1, "firewall": 1, "avail": "1", "cost": 100},
        "Sony Emperor": {"device_rating": 2, "data_processing": 2, "firewall": 1, "avail": "2", "cost": 700},
        "Renraku Sensei": {"device_rating": 3, "data_processing": 3, "firewall": 1, "avail": "2", "cost": 1000},
        "Erika Elite": {"device_rating": 4, "data_processing": 4, "firewall": 2, "avail": "3", "cost": 2500},
        "Hermes Ikon": {"device_rating": 5, "data_processing": 5, "firewall": 3, "avail": "4", "cost": 5000},
        "Transys Avalon": {"device_rating": 6, "data_processing": 6, "firewall": 3, "avail": "5", "cost": 8000}
    },
    "Cyberdecks": {
        "Erika MCD-1": {"device_rating": 1, "programs": 1, "attributes": "Attributsverteilung: 4, 3, 2, 1", "avail": "3I", "cost": 49500},
        "Microtrónica Azteca 200": {"device_rating": 2, "programs": 2, "attributes": "5, 4, 3, 2", "avail": "4I", "cost": 110250},
        "Hermes Chariot": {"device_rating": 3, "programs": 3, "attributes": "6, 5, 4, 3", "avail": "5I", "cost": 205000},
        "Renraku Kitsune": {"device_rating": 4, "programs": 4, "attributes": "7, 6, 5, 4", "avail": "6I", "cost": 346500},
        "Shiawase Cyber-5": {"device_rating": 5, "programs": 5, "attributes": "8, 7, 6, 5", "avail": "7I", "cost": 547500},
        "Fairlight Excalibur": {"device_rating": 6, "programs": 6, "attributes": "9, 8, 7, 6", "avail": "8I", "cost": 823200}
    },
    "Riggerkonsolen": {
        "Aus Schrott gebastelt": {"device_rating": 1, "data_processing": 3, "firewall": 2, "avail": "1L", "cost": 1400},
        "Allegiance Control Center": {"device_rating": 2, "data_processing": 3, "firewall": 3, "avail": "3L", "cost": 8000},
        "Essy Motors DroneMaster": {"device_rating": 3, "data_processing": 4, "firewall": 4, "avail": "3L", "cost": 16000},
        "Horizon Overseer": {"device_rating": 4, "data_processing": 5, "firewall": 4, "avail": "4L", "cost": 32000},
        "Mærsk Spider": {"device_rating": 4, "data_processing": 4, "firewall": 5, "avail": "5L", "cost": 34000},
        "Vulcan Liegelord": {"device_rating": 5, "data_processing": 6, "firewall": 5, "avail": "5L", "cost": 66000},
        "Proteus Poseidon": {"device_rating": 5, "data_processing": 5, "firewall": 6, "avail": "6L", "cost": 68000},
        "Transys Eidolon": {"device_rating": 6, "data_processing": 6, "firewall": 5, "avail": "7L", "cost": 75000},
        "Ares Red Dog": {"device_rating": 6, "data_processing": 7, "firewall": 6, "avail": "8L", "cost": 95000},
        "Aztechnology Tlaloc": {"device_rating": 6, "data_processing": 8, "firewall": 7, "avail": "9L", "cost": 140000}
    },
    "Autosofts": {
        "Clearsight": {"type": "Wahrnehmung", "target": "universal", "cost_formula": "Stufe * 500 ¥"},
        "Ausweichen": {"type": "Verteidigung", "target": "universal", "cost_formula": "Stufe * 500 ¥"},
        "Manövrieren": {"type": "Steuern", "target": "drone_model", "cost_formula": "Stufe * 500 ¥"},
        "Zielerfassung": {"type": "Angriff", "target": "weapon_model", "cost_formula": "Stufe * 500 ¥"},
        "Stealth": {"type": "Tarnung", "target": "drone_model", "cost_formula": "Stufe * 500 ¥"},
        "Elektronische Kriegsführung": {"type": "ECM/Cracken", "target": "universal", "cost_formula": "Stufe * 500 ¥"}
    }
}
with open(f'{OUT_DIR}/electronics_software.json', 'w', encoding='utf-8') as f:
    json.dump(elec_software, f, indent=2, ensure_ascii=False)

# -------------------------------------------------------------
# 7. SPELLS & ADEPT POWERS (from GRW + Arkane Kräfte)
# -------------------------------------------------------------
magic_catalog = {
    "Spells": {
        "Kampfzauber": {
            "Blitzstrahl": {"type": "Physisch", "range": "Blickfeld", "duration": "Augenblicklich", "drain": 4, "damage": "K", "effect": "Elektrischer Schaden, Status Verwirrt"},
            "Kugelblitz": {"type": "Physisch", "range": "Blickfeld (Fläche)", "duration": "Augenblicklich", "drain": 5, "damage": "K", "effect": "Flächenschaden Elektrizität"},
            "Feuerstrahl": {"type": "Physisch", "range": "Blickfeld", "duration": "Augenblicklich", "drain": 4, "damage": "K", "effect": "Feuerschaden, Status Brennend"},
            "Feuerball": {"type": "Physisch", "range": "Blickfeld (Fläche)", "duration": "Augenblicklich", "drain": 5, "damage": "K", "effect": "Flächenschaden Feuer"},
            "Manablitz": {"type": "Mana", "range": "Blickfeld", "duration": "Augenblicklich", "drain": 4, "damage": "K", "effect": "Direkter Manaschaden (ignoriert Panzerung)"},
            "Manaball": {"type": "Mana", "range": "Blickfeld (Fläche)", "duration": "Augenblicklich", "drain": 6, "damage": "K", "effect": "Direkter Flächen-Manaschaden"},
            "Betäubungsblitz": {"type": "Mana", "range": "Blickfeld", "duration": "Augenblicklich", "drain": 3, "damage": "B", "effect": "Direkter Betäubungsschaden"},
            "Betäubungsball": {"type": "Mana", "range": "Blickfeld (Fläche)", "duration": "Augenblicklich", "drain": 4, "damage": "B", "effect": "Direkter Flächen-Betäubungsschaden"}
        },
        "Entdeckungszauber": {
            "Feinde Entdecken": {"type": "Mana", "range": "Blickfeld (Fläche)", "duration": "Aufrechterhalten", "drain": 3, "effect": "Spürt feindselige Absichten auf"},
            "Leben Entdecken": {"type": "Mana", "range": "Blickfeld (Fläche)", "duration": "Aufrechterhalten", "drain": 2, "effect": "Findet lebende Wesen im Radius"},
            "Magie Entdecken": {"type": "Mana", "range": "Blickfeld (Fläche)", "duration": "Aufrechterhalten", "drain": 3, "effect": "Findet astrale & magische Quellen"},
            "Hellsicht": {"type": "Mana", "range": "Berührung", "duration": "Aufrechterhalten", "drain": 4, "effect": "Verstärkt Wahrnehmung über Distanz"}
        },
        "Heilzauber": {
            "Heilung": {"type": "Physisch", "range": "Berührung", "duration": "Permanent", "drain": 3, "effect": "Heilt 1 Kästchen körperlichen Schaden je Nettoerfolg"},
            "Betäubung Heilen": {"type": "Mana", "range": "Berührung", "duration": "Permanent", "drain": 2, "effect": "Heilt Betäubungsschaden"},
            "Reflexe Steigern": {"type": "Physisch", "range": "Berührung", "duration": "Aufrechterhalten", "drain": 5, "effect": "+1 Reaktion, +1W6 Initiative pro Nettoerfolg (max 4)"},
            "Entgiften": {"type": "Physisch", "range": "Berührung", "duration": "Permanent", "drain": 2, "effect": "Neutralisiert Toxine und Gifte"}
        },
        "Illusionszauber": {
            "Unsichtbarkeit": {"type": "Mana", "range": "Berührung", "duration": "Aufrechterhalten", "drain": 3, "effect": "Verleiht Status Unsichtbar gegenüber Lebewesen"},
            "Verbesserte Unsichtbarkeit": {"type": "Physisch", "range": "Berührung", "duration": "Aufrechterhalten", "drain": 4, "effect": "Unsichtbar auch gegenüber Kameras/Sensoren"},
            "Maske": {"type": "Mana", "range": "Berührung", "duration": "Aufrechterhalten", "drain": 3, "effect": "Verändert das visuelle Aussehen"},
            "Stille": {"type": "Physisch", "range": "Blickfeld (Fläche)", "duration": "Aufrechterhalten", "drain": 4, "effect": "Erzeugt vollkommene akustische Stille"}
        },
        "Manipulationszauber": {
            "Panzer": {"type": "Physisch", "range": "Berührung", "duration": "Aufrechterhalten", "drain": 4, "effect": "+1 Verteidigungswert pro Nettoerfolg"},
            "Physische Barriere": {"type": "Physisch", "range": "Blickfeld", "duration": "Aufrechterhalten", "drain": 5, "effect": "Erzeugt feste Barriere gegen physische Angriffe"},
            "Manabarriere": {"type": "Mana", "range": "Blickfeld", "duration": "Aufrechterhalten", "drain": 4, "effect": "Blockiert astrale Gestalten und Zauber"},
            "Gedanken Beherrschen": {"type": "Mana", "range": "Blickfeld", "duration": "Aufrechterhalten", "drain": 5, "effect": "Zwingt Zielperson Handlungen auf"},
            "Levitation": {"type": "Physisch", "range": "Blickfeld", "duration": "Aufrechterhalten", "drain": 4, "effect": "Hebt und bewegt Gegenstände und Personen per Telekinese"}
        }
    },
    "AdeptPowers": {
        "Geschärfter Sinn": {"cost": 0.25, "levels": True, "effect": "+1 Würfel auf Wahrnehmung für einen gewählten Sinn"},
        "Gesteigerte Reflexe 1": {"cost": 1.5, "levels": False, "effect": "+1 Reaktion, +1W6 Initiative, +1 Nebenhandlung"},
        "Gesteigerte Reflexe 2": {"cost": 2.5, "levels": False, "effect": "+2 Reaktion, +2W6 Initiative, +2 Nebenhandlungen"},
        "Gesteigerte Reflexe 3": {"cost": 3.5, "levels": False, "effect": "+3 Reaktion, +3W6 Initiative, +3 Nebenhandlungen"},
        "Astrale Wahrnehmung": {"cost": 1.0, "levels": False, "effect": "Erlaubt Blicken in den Astralraum"},
        "Kritischer Schlag": {"cost": 0.5, "levels": True, "effect": "+1 Nahkampfschadenswert"},
        "Todeskralle": {"cost": 0.5, "levels": False, "effect": "Waffenlose Angriffe verursachen körperlichen Schaden (K)"},
        "Mystischer Panzer": {"cost": 0.5, "levels": True, "effect": "+1 Verteidigungswert je Stufe"},
        "Geschoss-Parieren": {"cost": 0.5, "levels": False, "effect": "Erlaubt das Parieren von Wurfwaffen/Pfeilen im Flug"},
        "Körpersinn": {"cost": 0.5, "levels": True, "effect": "+1 auf Balance, Akrobatik und Klettern"}
    }
}
with open(f'{OUT_DIR}/magic_spells_powers.json', 'w', encoding='utf-8') as f:
    json.dump(magic_catalog, f, indent=2, ensure_ascii=False)

# -------------------------------------------------------------
# 8. MATRIX ACTIONS & TECHNOMANCER ECHOES
# -------------------------------------------------------------
matrix_catalog = {
    "Actions": {
        "Gerät steuern": {"skill": "Elektronik + Logik", "type": "Haupthandlung", "description": "Führt Fernbefehl auf kompromittiertem Gerät aus"},
        "Brute Force": {"skill": "Cracken + Logik", "type": "Haupthandlung", "description": "Gewaltsamer Zugang, generiert Matrix-Overwatch (OS)"},
        "Sondieren": {"skill": "Cracken + Logik", "type": "Ausgedehnte Probe", "description": "Heimlicher Zugang ohne Overwatch-Generierung"},
        "Hintertür nutzen": {"skill": "Cracken + Logik", "type": "Haupthandlung", "description": "Schneller Zugriff nach erfolgreichem Sondieren"},
        "Datenklau": {"skill": "Elektronik + Logik", "type": "Haupthandlung", "description": "Herunterladen geschützter Paydata"},
        "Spurlos löschen": {"skill": "Cracken + Logik", "type": "Haupthandlung", "description": "Löscht Spuren und Matrix-Logs"},
        "Verstecken": {"skill": "Cracken + Intuition", "type": "Haupthandlung", "description": "Macht Persona in der Matrix unsichtbar"}
    },
    "Technomancer_Echoes": {
        "Maschinenbeherrschung": {"effect": "Erhält die Effekte einer Riggerkontrolle Stufe 1"},
        "Lebendes Netzwerk": {"effect": "Lebende Persona kann Slaves in ein eigenes PAN einbinden"},
        "Neurofilter": {"effect": "+1 Würfel gegen Biofeedback-Schaden"},
        "Skinlink": {"effect": "Direktverbindung (DNI) durch physische Hautberührung"},
        "Übertakten": {"effect": "+1W6 Matrix-Initiative in heißer VR"}
    }
}
with open(f'{OUT_DIR}/matrix_actions_programs.json', 'w', encoding='utf-8') as f:
    json.dump(matrix_catalog, f, indent=2, ensure_ascii=False)

# -------------------------------------------------------------
# 9. METAVARIANTS & METASAPIENTS (Schattenkompendium)
# -------------------------------------------------------------
metavariants = {
    "Elfen": {
        "Nächtliche": {"attributes": {"agility_max": 7, "charisma_max": 8}, "qualities": ["Nachtaktiv", "Infrarotsicht", "Lichtempfindlichkeit"]},
        "Wakyambi": {"attributes": {"agility_max": 7, "charisma_max": 8}, "qualities": ["Großwüchsig", "Restlichtverstärkung"]}
    },
    "Zwerge": {
        "Gnome": {"attributes": {"strength_max": 6, "willpower_max": 7}, "qualities": ["Neotenie", "Arkaner Arretierer"]},
        "Menehune": {"attributes": {"body_max": 7, "strength_max": 8}, "qualities": ["Schwimmer", "Infrarotsicht"]}
    },
    "Orks": {
        "Hobgoblins": {"attributes": {"body_max": 8, "strength_max": 8, "charisma_max": 4}, "qualities": ["Reizbar", "Restlichtverstärkung"]},
        "Oger": {"attributes": {"body_max": 9, "strength_max": 8}, "qualities": ["Erhöhte Schmerztoleranz", "Verdauungstrakt aus Stahl"]},
        "Oni": {"attributes": {"body_max": 8, "strength_max": 8, "charisma_max": 6}, "qualities": ["Auffällige Färbung", "Hörner", "Restlichtverstärkung"]}
    },
    "Trolle": {
        "Fomori": {"attributes": {"body_max": 9, "strength_max": 9}, "qualities": ["Arkaner Schutz", "Dermalablagerungen"]},
        "Minotauren": {"attributes": {"body_max": 10, "strength_max": 9}, "qualities": ["Hörner", "Breiter Körperbau"]},
        "Zyklopen": {"attributes": {"body_max": 10, "strength_max": 10}, "qualities": ["Zyklopenauge", "Schwere Hiebe"]}
    },
    "Metasapiente": {
        "Zentauren": {"type": "Vierbeinig", "body_max": 10, "strength_max": 9, "qualities": ["Pferdekörper", "Naturverbunden"]},
        "Naga": {"type": "Schlangenleib", "body_max": 8, "strength_max": 8, "qualities": ["Dualwesen", "Giftbiss", "Magiebegabt"]},
        "Pixies": {"type": "Feenwesen", "body_max": 2, "strength_max": 2, "agility_max": 8, "qualities": ["Flügel", "Astrale Projektion", "Verschwinden"]},
        "Sasquatch": {"type": "Primitiv-Metasapient", "body_max": 10, "strength_max": 10, "qualities": ["Fell", "Schrei", "Stumm"]}
    }
}
with open(f'{OUT_DIR}/metavariants.json', 'w', encoding='utf-8') as f:
    json.dump(metavariants, f, indent=2, ensure_ascii=False)

print('All 10 comprehensive catalog files successfully created!')


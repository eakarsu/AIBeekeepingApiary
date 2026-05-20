const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'beekeeping_apiary',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('[seed] resetting tables...');
    await client.query(`
      DROP TABLE IF EXISTS apiaries              CASCADE;
      DROP TABLE IF EXISTS hives                 CASCADE;
      DROP TABLE IF EXISTS queens                CASCADE;
      DROP TABLE IF EXISTS inspections           CASCADE;
      DROP TABLE IF EXISTS treatments            CASCADE;
      DROP TABLE IF EXISTS honey_harvests        CASCADE;
      DROP TABLE IF EXISTS supplies              CASCADE;
      DROP TABLE IF EXISTS equipment             CASCADE;
      DROP TABLE IF EXISTS beekeepers            CASCADE;
      DROP TABLE IF EXISTS pollination_contracts CASCADE;
      DROP TABLE IF EXISTS customers             CASCADE;
      DROP TABLE IF EXISTS plant_sources         CASCADE;
      DROP TABLE IF EXISTS weather_briefs        CASCADE;
      DROP TABLE IF EXISTS disease_outbreaks     CASCADE;
      DROP TABLE IF EXISTS swarms                CASCADE;
      DROP TABLE IF EXISTS varroa_counts         CASCADE;
      DROP TABLE IF EXISTS hive_sounds           CASCADE;
      DROP TABLE IF EXISTS audit_log             CASCADE;
      DROP TABLE IF EXISTS ai_results            CASCADE;

      DROP TABLE IF EXISTS users                 CASCADE;
      DROP TABLE IF EXISTS notifications         CASCADE;
      DROP TABLE IF EXISTS attachments           CASCADE;
      DROP TABLE IF EXISTS webhooks              CASCADE;
      DROP TABLE IF EXISTS webhook_deliveries    CASCADE;
    `);

    console.log('[seed] applying migrations...');
    const schema1 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_schema.sql'), 'utf8');
    await client.query(schema1);
    const schema2 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '002_schema.sql'), 'utf8');
    await client.query(schema2);

    console.log('[seed] inserting apiaries...');
    const apiaries = [
      ['AP-001','Meadow Ridge Apiary','Sonoma County, CA',  48,'Rivera Honey Co.','active'],
      ['AP-002','Cedar Hollow Yard',  'Bend, OR',           36,'Cedar Hollow LLC','active'],
      ['AP-003','Orchard Crest Bees', 'Yakima, WA',         72,'Orchard Crest Inc.','active'],
      ['AP-004','Wildflower Acres',   'Boulder, CO',        24,'Mountain Apiaries','active'],
      ['AP-005','Sunset Mesa Yard',   'Santa Fe, NM',       30,'Sunset Mesa Honey','active'],
      ['AP-006','Pine River Bees',    'Missoula, MT',       42,'Pine River Apiaries','active'],
      ['AP-007','Heritage Field',     'Lancaster, PA',      54,'Heritage Farms','active'],
      ['AP-008','Coastal Pollen Yard','Eureka, CA',         28,'Coastal Bees Co.','active'],
      ['AP-009','Almond Bloom Yard',  'Modesto, CA',       120,'Almond Bloom Partners','active'],
      ['AP-010','High Desert Hives',  'Tucson, AZ',         22,'High Desert Honey','active'],
      ['AP-011','River Birch Yard',   'Asheville, NC',      40,'River Birch Bees','active'],
      ['AP-012','Lake Country Bees',  'Madison, WI',        38,'Lake Country LLC','active'],
      ['AP-013','Granite Hills Yard', 'Concord, NH',        26,'Granite Hills Honey','inactive'],
      ['AP-014','Prairie Wind Bees',  'Lincoln, NE',        46,'Prairie Wind Co.','active'],
      ['AP-015','Tidewater Apiary',   'Williamsburg, VA',   32,'Tidewater Honey','active'],
    ];
    for (const a of apiaries) {
      await client.query(
        `INSERT INTO apiaries (apiary_id,name,location,hive_count,owner,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        a
      );
    }

    console.log('[seed] inserting hives...');
    const hives = [
      ['HV-1001','AP-001','QN-001',10,'2026-05-10','strong'],
      ['HV-1002','AP-001','QN-002', 8,'2026-05-10','strong'],
      ['HV-1003','AP-002','QN-003', 9,'2026-05-08','moderate'],
      ['HV-1004','AP-003','QN-004',10,'2026-05-12','strong'],
      ['HV-1005','AP-003','QN-005', 7,'2026-05-12','weak'],
      ['HV-1006','AP-004','QN-006', 9,'2026-05-09','moderate'],
      ['HV-1007','AP-005','QN-007', 8,'2026-05-11','strong'],
      ['HV-1008','AP-006','QN-008',10,'2026-05-13','strong'],
      ['HV-1009','AP-007','QN-009', 9,'2026-05-07','moderate'],
      ['HV-1010','AP-008','QN-010', 6,'2026-05-06','weak'],
      ['HV-1011','AP-009','QN-011',10,'2026-05-14','strong'],
      ['HV-1012','AP-009','QN-012',10,'2026-05-14','strong'],
      ['HV-1013','AP-010','QN-013', 8,'2026-05-05','moderate'],
      ['HV-1014','AP-011','QN-014', 9,'2026-05-11','strong'],
      ['HV-1015','AP-012','QN-015', 7,'2026-05-09','weak'],
    ];
    for (const h of hives) {
      await client.query(
        `INSERT INTO hives (hive_id,apiary_id,queen_id,frame_count,last_inspection,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        h
      );
    }

    console.log('[seed] inserting queens...');
    const queens = [
      ['QN-001','HV-1001','Italian',     2025,'green','laying'],
      ['QN-002','HV-1002','Carniolan',   2024,'red',  'laying'],
      ['QN-003','HV-1003','Russian',     2025,'green','laying'],
      ['QN-004','HV-1004','Buckfast',    2025,'green','laying'],
      ['QN-005','HV-1005','Italian',     2023,'white','failing'],
      ['QN-006','HV-1006','Carniolan',   2025,'green','laying'],
      ['QN-007','HV-1007','Saskatraz',   2025,'green','laying'],
      ['QN-008','HV-1008','Italian',     2024,'red',  'laying'],
      ['QN-009','HV-1009','VSH Italian', 2025,'green','laying'],
      ['QN-010','HV-1010','Caucasian',   2022,'yellow','superseded'],
      ['QN-011','HV-1011','Italian',     2025,'green','laying'],
      ['QN-012','HV-1012','Buckfast',    2025,'green','laying'],
      ['QN-013','HV-1013','Saskatraz',   2024,'red',  'laying'],
      ['QN-014','HV-1014','Carniolan',   2025,'green','laying'],
      ['QN-015','HV-1015','Italian',     2023,'white','failing'],
    ];
    for (const q of queens) {
      await client.query(
        `INSERT INTO queens (queen_id,hive_id,breed,year,marked,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        q
      );
    }

    console.log('[seed] inserting inspections...');
    const inspections = [
      ['INSP-2026-001','HV-1001','Maria Rivera',   '2026-05-10','solid','healthy'],
      ['INSP-2026-002','HV-1002','Maria Rivera',   '2026-05-10','spotty','healthy'],
      ['INSP-2026-003','HV-1003','James Cedar',    '2026-05-08','solid','healthy'],
      ['INSP-2026-004','HV-1004','Priya Sharma',   '2026-05-12','solid','healthy'],
      ['INSP-2026-005','HV-1005','Priya Sharma',   '2026-05-12','spotty','queenless'],
      ['INSP-2026-006','HV-1006','Tom Boulder',    '2026-05-09','solid','healthy'],
      ['INSP-2026-007','HV-1007','Lily Mesa',      '2026-05-11','solid','healthy'],
      ['INSP-2026-008','HV-1008','Karl Pine',      '2026-05-13','solid','healthy'],
      ['INSP-2026-009','HV-1009','Eli Heritage',   '2026-05-07','spotty','varroa_present'],
      ['INSP-2026-010','HV-1010','Anna Coast',     '2026-05-06','poor','weak_colony'],
      ['INSP-2026-011','HV-1011','Diego Almond',   '2026-05-14','solid','healthy'],
      ['INSP-2026-012','HV-1012','Diego Almond',   '2026-05-14','solid','healthy'],
      ['INSP-2026-013','HV-1013','Sara Desert',    '2026-05-05','spotty','moderate'],
      ['INSP-2026-014','HV-1014','Owen Birch',     '2026-05-11','solid','healthy'],
      ['INSP-2026-015','HV-1015','Jane Lake',      '2026-05-09','poor','queenless'],
    ];
    for (const i of inspections) {
      await client.query(
        `INSERT INTO inspections (inspection_id,hive_id,inspector,date,brood_pattern,health) VALUES ($1,$2,$3,$4,$5,$6)`,
        i
      );
    }

    console.log('[seed] inserting treatments...');
    const treatments = [
      ['TRT-2026-001','HV-1001','Apivar (amitraz)',     '2 strips/brood box','2026-05-11','applied'],
      ['TRT-2026-002','HV-1003','Oxalic acid dribble',  '50ml/colony',       '2026-05-09','applied'],
      ['TRT-2026-003','HV-1005','Apiguard (thymol)',    '50g tray',          '2026-05-13','applied'],
      ['TRT-2026-004','HV-1009','Formic Pro',           '2 pads',            '2026-05-08','applied'],
      ['TRT-2026-005','HV-1010','Apivar (amitraz)',     '2 strips/brood box','2026-05-07','applied'],
      ['TRT-2026-006','HV-1013','Oxalic acid vapor',    '2g per hive',       '2026-05-06','applied'],
      ['TRT-2026-007','HV-1015','Apiguard (thymol)',    '50g tray',          '2026-05-10','applied'],
      ['TRT-2026-008','HV-1002','Formic Pro',           '2 pads',            '2026-05-12','scheduled'],
      ['TRT-2026-009','HV-1004','Apivar (amitraz)',     '2 strips/brood box','2026-05-15','scheduled'],
      ['TRT-2026-010','HV-1006','Oxalic acid dribble',  '50ml/colony',       '2026-05-15','scheduled'],
      ['TRT-2026-011','HV-1007','Apiguard (thymol)',    '50g tray',          '2026-05-16','scheduled'],
      ['TRT-2026-012','HV-1008','Formic Pro',           '2 pads',            '2026-05-16','scheduled'],
      ['TRT-2026-013','HV-1011','Apivar (amitraz)',     '2 strips/brood box','2026-05-18','scheduled'],
      ['TRT-2026-014','HV-1012','Apivar (amitraz)',     '2 strips/brood box','2026-05-18','scheduled'],
      ['TRT-2026-015','HV-1014','Oxalic acid vapor',    '2g per hive',       '2026-05-17','scheduled'],
    ];
    for (const t of treatments) {
      await client.query(
        `INSERT INTO treatments (treatment_id,hive_id,product,dosage,applied_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        t
      );
    }

    console.log('[seed] inserting honey_harvests...');
    const harvests = [
      ['HARV-2026-001','HV-1001', 28.4,'Wildflower',     '2026-05-01','in_storage'],
      ['HARV-2026-002','HV-1002', 22.1,'Wildflower',     '2026-05-01','in_storage'],
      ['HARV-2026-003','HV-1003', 19.8,'Clover',         '2026-04-28','bottled'],
      ['HARV-2026-004','HV-1004', 35.2,'Orange blossom', '2026-05-05','in_storage'],
      ['HARV-2026-005','HV-1005',  9.4,'Wildflower',     '2026-05-05','bottled'],
      ['HARV-2026-006','HV-1006', 21.7,'Clover',         '2026-05-02','in_storage'],
      ['HARV-2026-007','HV-1007', 17.6,'Mesquite',       '2026-05-03','in_storage'],
      ['HARV-2026-008','HV-1008', 30.5,'Clover',         '2026-05-04','bottled'],
      ['HARV-2026-009','HV-1009', 24.0,'Wildflower',     '2026-04-29','sold'],
      ['HARV-2026-010','HV-1010', 10.2,'Coastal',        '2026-04-30','bottled'],
      ['HARV-2026-011','HV-1011', 42.6,'Almond',         '2026-05-06','sold'],
      ['HARV-2026-012','HV-1012', 41.9,'Almond',         '2026-05-06','sold'],
      ['HARV-2026-013','HV-1013', 13.8,'Mesquite',       '2026-05-02','in_storage'],
      ['HARV-2026-014','HV-1014', 26.5,'Wildflower',     '2026-05-05','bottled'],
      ['HARV-2026-015','HV-1015',  8.3,'Buckwheat',      '2026-05-04','bottled'],
    ];
    for (const h of harvests) {
      await client.query(
        `INSERT INTO honey_harvests (harvest_id,hive_id,kg,type,harvested_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        h
      );
    }

    console.log('[seed] inserting supplies...');
    const supplies = [
      ['SUP-001','Wooden frames (deep)',            420,'Main warehouse',100,'in_stock'],
      ['SUP-002','Wax foundation sheets',           300,'Main warehouse', 80,'in_stock'],
      ['SUP-003','Hive bodies (10-frame deep)',      45,'Main warehouse', 20,'in_stock'],
      ['SUP-004','Inner covers',                     60,'Main warehouse', 25,'in_stock'],
      ['SUP-005','Telescoping outer covers',         55,'Main warehouse', 25,'in_stock'],
      ['SUP-006','Apivar strips (pack of 10)',       18,'Cold storage',   10,'in_stock'],
      ['SUP-007','Oxalic acid (1kg)',                 6,'Cold storage',    5,'reorder'],
      ['SUP-008','Apiguard trays (pack of 10)',      14,'Cold storage',   10,'in_stock'],
      ['SUP-009','Smoker fuel (cotton pellets)',     90,'Field van',      40,'in_stock'],
      ['SUP-010','1lb honey jars (case 12)',        260,'Bottling room',  60,'in_stock'],
      ['SUP-011','Honey filter (200 micron)',         8,'Bottling room',   4,'in_stock'],
      ['SUP-012','Sugar syrup (gallon)',             24,'Field van',      12,'in_stock'],
      ['SUP-013','Queen cages',                      40,'Main warehouse', 25,'in_stock'],
      ['SUP-014','Pollen patties',                   30,'Cold storage',   15,'in_stock'],
      ['SUP-015','Bee escape boards',                22,'Main warehouse', 10,'in_stock'],
    ];
    for (const s of supplies) {
      await client.query(
        `INSERT INTO supplies (supply_id,item,qty,location,reorder_point,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        s
      );
    }

    console.log('[seed] inserting equipment...');
    const equipment = [
      ['EQ-001','Honey extractor (20-frame)','EX-20-4421','Bottling room','2026-03-15','operational'],
      ['EQ-002','Uncapping tank',            'UC-1102',   'Bottling room','2026-02-20','operational'],
      ['EQ-003','Wax melter (solar)',        'WM-SOLAR-8','Main warehouse','2026-04-01','operational'],
      ['EQ-004','Beekeeper truck (F-250)',   'VIN-AB1234','Field van bay','2026-04-10','operational'],
      ['EQ-005','Pickup trailer',            'TR-9981',   'Field van bay','2025-11-12','operational'],
      ['EQ-006','Refractometer',             'RF-882',    'Lab',          '2026-01-05','operational'],
      ['EQ-007','Microscope',                'MS-44A',    'Lab',          '2025-12-12','operational'],
      ['EQ-008','Hive scale (Broodminder)',  'BM-7733',   'AP-001',       '2026-04-22','operational'],
      ['EQ-009','Hive scale (Broodminder)',  'BM-7734',   'AP-003',       '2026-04-22','operational'],
      ['EQ-010','Electric uncapping knife',  'EUK-201',   'Bottling room','2025-09-30','needs_service'],
      ['EQ-011','Smoker (large stainless)',  'SM-100',    'Field van bay','2026-03-01','operational'],
      ['EQ-012','Bee vacuum',                'BV-3001',   'Field van bay','2025-10-15','operational'],
      ['EQ-013','Mating nuc boxes (set 10)', 'MN-200',    'Main warehouse','2026-02-14','operational'],
      ['EQ-014','Solar fence charger',       'SFC-50',    'AP-006',       '2026-03-22','operational'],
      ['EQ-015','Pollen trap',               'PT-77',     'AP-009',       '2026-04-05','operational'],
    ];
    for (const e of equipment) {
      await client.query(
        `INSERT INTO equipment (eq_id,type,sn,location,last_service,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        e
      );
    }

    console.log('[seed] inserting beekeepers...');
    const beekeepers = [
      ['BK-001','Maria Rivera',  'Master Beekeeper, EAS-certified',     'Meadow Ridge HQ', 48,'active'],
      ['BK-002','James Cedar',   'Journeyman, OSBA',                    'Cedar Hollow',    36,'active'],
      ['BK-003','Priya Sharma',  'Master Beekeeper, WSBA',              'Orchard Crest',   72,'active'],
      ['BK-004','Tom Boulder',   'Apprentice, CSBA',                    'Wildflower Acres',24,'active'],
      ['BK-005','Lily Mesa',     'Journeyman, NMBKA',                   'Sunset Mesa',     30,'active'],
      ['BK-006','Karl Pine',     'Master Beekeeper, MBA',               'Pine River',      42,'active'],
      ['BK-007','Eli Heritage',  'Journeyman, PSBA',                    'Heritage Field',  54,'active'],
      ['BK-008','Anna Coast',    'Apprentice, CSBA',                    'Coastal Pollen',  28,'active'],
      ['BK-009','Diego Almond',  'Master Beekeeper, CSBA',              'Almond Bloom',   120,'active'],
      ['BK-010','Sara Desert',   'Journeyman, AZBKA',                   'High Desert',     22,'active'],
      ['BK-011','Owen Birch',    'Apprentice, NCSBA',                   'River Birch',     40,'active'],
      ['BK-012','Jane Lake',     'Journeyman, WIBKA',                   'Lake Country',    38,'on_leave'],
      ['BK-013','Mark Granite',  'Master Beekeeper, NHBKA',             'Granite Hills',   26,'inactive'],
      ['BK-014','Helen Prairie', 'Journeyman, NSBA',                    'Prairie Wind',    46,'active'],
      ['BK-015','Sam Tide',      'Apprentice, VSBA',                    'Tidewater',       32,'active'],
    ];
    for (const b of beekeepers) {
      await client.query(
        `INSERT INTO beekeepers (beekeeper_id,name,certifications,base,hives_managed,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        b
      );
    }

    console.log('[seed] inserting pollination_contracts...');
    const contracts = [
      ['POL-2026-001','CUS-001','Almonds',     120, 36000,'active'],
      ['POL-2026-002','CUS-002','Blueberries',  40, 12000,'active'],
      ['POL-2026-003','CUS-003','Apples',       30,  9000,'active'],
      ['POL-2026-004','CUS-004','Cherries',     24,  7200,'pending'],
      ['POL-2026-005','CUS-005','Cucumbers',    20,  5500,'active'],
      ['POL-2026-006','CUS-006','Squash',       16,  4400,'active'],
      ['POL-2026-007','CUS-007','Cranberries',  35, 10500,'active'],
      ['POL-2026-008','CUS-008','Avocados',     28,  9800,'active'],
      ['POL-2026-009','CUS-009','Watermelons',  18,  5400,'active'],
      ['POL-2026-010','CUS-010','Strawberries', 22,  6600,'active'],
      ['POL-2026-011','CUS-011','Pears',        24,  7200,'pending'],
      ['POL-2026-012','CUS-012','Sunflowers',   30,  7500,'active'],
      ['POL-2026-013','CUS-013','Canola',       40, 10000,'active'],
      ['POL-2026-014','CUS-014','Plums',        18,  5400,'completed'],
      ['POL-2026-015','CUS-015','Melons',       20,  6000,'active'],
    ];
    for (const c of contracts) {
      await client.query(
        `INSERT INTO pollination_contracts (contract_id,customer_id,crop,hives_committed,fee_usd,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        c
      );
    }

    console.log('[seed] inserting customers...');
    const customers = [
      ['CUS-001','Central Valley Almond Growers',  'orchard',    'Modesto, CA',     '2026-02-15','active'],
      ['CUS-002','Cascade Blueberry Co-op',        'orchard',    'Salem, OR',       '2026-04-10','active'],
      ['CUS-003','Yakima Apple Partners',          'orchard',    'Yakima, WA',      '2026-04-22','active'],
      ['CUS-004','Bing Cherry Growers',            'orchard',    'Hood River, OR',  '2026-03-05','active'],
      ['CUS-005','Southwest Cucumber LLC',         'farm',       'Yuma, AZ',        '2026-03-18','active'],
      ['CUS-006','Sunshine Squash Farms',          'farm',       'Bakersfield, CA', '2026-04-01','active'],
      ['CUS-007','Wisconsin Cranberry Marsh',      'farm',       'Wisconsin Rapids, WI','2026-05-02','active'],
      ['CUS-008','Coastal Avocado Growers',        'orchard',    'Carpinteria, CA', '2026-04-08','active'],
      ['CUS-009','Texas Melon Producers',          'farm',       'Pecos, TX',       '2026-03-22','active'],
      ['CUS-010','Berry Farms NW',                 'farm',       'Lynden, WA',      '2026-04-15','active'],
      ['CUS-011','Hood River Pear Co.',            'orchard',    'Hood River, OR',  '2026-03-30','active'],
      ['CUS-012','Dakota Sunflower Growers',       'farm',       'Bismarck, ND',    '2026-04-25','active'],
      ['CUS-013','Northern Plains Canola',         'farm',       'Minot, ND',       '2026-04-20','active'],
      ['CUS-014','Valley Plum Partners',           'orchard',    'Lodi, CA',        '2026-02-28','inactive'],
      ['CUS-015','Sandhill Melons Inc.',           'farm',       'Sterling, CO',    '2026-03-12','active'],
    ];
    for (const c of customers) {
      await client.query(
        `INSERT INTO customers (customer_id,name,type,region,last_contract,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        c
      );
    }

    console.log('[seed] inserting plant_sources...');
    const plants = [
      ['PS-001','Almond (Prunus dulcis)',  3.2, 'Feb-Mar','high','available'],
      ['PS-002','Wildflower mix',          1.0, 'Apr-Sep','medium','available'],
      ['PS-003','White clover',            0.6, 'May-Aug','high','available'],
      ['PS-004','Orange blossom',          5.5, 'Mar-Apr','very_high','available'],
      ['PS-005','Mesquite',                4.0, 'Apr-Jun','medium','available'],
      ['PS-006','Goldenrod',               2.2, 'Aug-Oct','high','available'],
      ['PS-007','Sourwood',                6.8, 'Jun-Jul','high','available'],
      ['PS-008','Tupelo',                  7.4, 'Apr-May','very_high','seasonal'],
      ['PS-009','Buckwheat',               1.6, 'Jul-Sep','medium','available'],
      ['PS-010','Sunflower',               2.5, 'Jun-Aug','medium','available'],
      ['PS-011','Canola (Rapeseed)',       3.1, 'Apr-Jun','high','available'],
      ['PS-012','Blueberry blossom',       2.8, 'Apr-May','medium','seasonal'],
      ['PS-013','Cranberry blossom',       2.9, 'Jun',    'medium','seasonal'],
      ['PS-014','Cherry blossom',          1.9, 'Mar-Apr','medium','seasonal'],
      ['PS-015','Sage',                    3.6, 'May-Jul','high','available'],
    ];
    for (const p of plants) {
      await client.query(
        `INSERT INTO plant_sources (source_id,common_name,distance_km,blooms_at,nectar_yield,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        p
      );
    }

    console.log('[seed] inserting weather_briefs...');
    const weather = [
      ['WX-2026-001','Sonoma County, CA','2026-05-15 12:00+00',22.4, 8.5,'Clear; light breeze; ideal foraging'],
      ['WX-2026-002','Bend, OR',         '2026-05-15 12:00+00',16.1,12.0,'Partly cloudy; gust 18kt'],
      ['WX-2026-003','Yakima, WA',       '2026-05-15 12:00+00',18.7, 6.0,'Sunny; warm afternoon'],
      ['WX-2026-004','Boulder, CO',      '2026-05-15 12:00+00',14.3,10.5,'Scattered showers PM'],
      ['WX-2026-005','Santa Fe, NM',     '2026-05-15 12:00+00',21.0, 7.0,'Clear; low humidity'],
      ['WX-2026-006','Missoula, MT',     '2026-05-15 12:00+00',13.5, 9.0,'Cool; intermittent clouds'],
      ['WX-2026-007','Lancaster, PA',    '2026-05-15 12:00+00',19.2, 5.0,'Sunny; mild'],
      ['WX-2026-008','Eureka, CA',       '2026-05-15 12:00+00',14.0,14.0,'Marine layer; cool'],
      ['WX-2026-009','Modesto, CA',      '2026-05-15 12:00+00',23.8, 6.5,'Warm; ideal almond foraging'],
      ['WX-2026-010','Tucson, AZ',       '2026-05-15 12:00+00',31.2, 4.5,'Hot; provide shade/water'],
      ['WX-2026-011','Asheville, NC',    '2026-05-15 12:00+00',20.1, 4.0,'Humid; chance TSRA late'],
      ['WX-2026-012','Madison, WI',      '2026-05-15 12:00+00',17.9, 8.0,'Cool front passing'],
      ['WX-2026-013','Concord, NH',      '2026-05-15 12:00+00',15.0, 6.5,'Cloudy; light winds'],
      ['WX-2026-014','Lincoln, NE',      '2026-05-15 12:00+00',22.2,12.5,'Windy; risk of dearth'],
      ['WX-2026-015','Williamsburg, VA', '2026-05-15 12:00+00',21.5, 5.5,'Sunny; ideal'],
    ];
    for (const w of weather) {
      await client.query(
        `INSERT INTO weather_briefs (brief_id,location,valid_at,temperature_c,wind_kt,forecast) VALUES ($1,$2,$3,$4,$5,$6)`,
        w
      );
    }

    console.log('[seed] inserting disease_outbreaks...');
    const outbreaks = [
      ['DOB-2026-001','AP-005','American Foulbrood (AFB)','critical','2026-05-01','open'],
      ['DOB-2026-002','AP-008','European Foulbrood (EFB)','high',    '2026-05-04','open'],
      ['DOB-2026-003','AP-013','Nosema ceranae',          'medium',  '2026-04-28','open'],
      ['DOB-2026-004','AP-015','Chalkbrood',              'low',     '2026-05-06','open'],
      ['DOB-2026-005','AP-010','Sacbrood virus',          'medium',  '2026-05-02','contained'],
      ['DOB-2026-006','AP-004','Varroa overload',         'high',    '2026-05-08','open'],
      ['DOB-2026-007','AP-007','Deformed Wing Virus (DWV)','high',   '2026-05-03','open'],
      ['DOB-2026-008','AP-002','Tracheal mites',          'low',     '2026-04-25','resolved'],
      ['DOB-2026-009','AP-014','Small hive beetle',       'medium',  '2026-05-07','open'],
      ['DOB-2026-010','AP-011','Wax moth',                'medium',  '2026-05-05','contained'],
      ['DOB-2026-011','AP-001','Robbing pressure',        'low',     '2026-05-10','resolved'],
      ['DOB-2026-012','AP-009','Pesticide kill',          'critical','2026-05-09','open'],
      ['DOB-2026-013','AP-006','Varroa overload',         'medium',  '2026-05-04','contained'],
      ['DOB-2026-014','AP-012','Nosema apis',             'low',     '2026-04-30','resolved'],
      ['DOB-2026-015','AP-003','EFB suspected',           'medium',  '2026-05-11','open'],
    ];
    for (const o of outbreaks) {
      await client.query(
        `INSERT INTO disease_outbreaks (outbreak_id,apiary_id,disease,severity,opened_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        o
      );
    }

    console.log('[seed] inserting swarms...');
    const swarms = [
      ['SW-2026-001','HV-1001','Oak tree, 4m, Meadow Ridge fence line', '2026-05-02 14:00+00','captured','Maria Rivera'],
      ['SW-2026-002','HV-1011','Almond branch, 2m, AP-009 row 4',       '2026-05-04 11:30+00','captured','Diego Almond'],
      ['SW-2026-003','HV-1004','Apple sapling, 1.5m, Orchard Crest',    '2026-05-05 10:00+00','captured','Priya Sharma'],
      ['SW-2026-004','HV-1003','Cedar trunk, 3m, Cedar Hollow',         '2026-05-06 09:45+00','captured','James Cedar'],
      ['SW-2026-005',null,     'Mailbox post, Bend OR (call-out)',      '2026-05-07 13:20+00','captured','James Cedar'],
      ['SW-2026-006','HV-1007','Pine branch, 5m, Sunset Mesa',          '2026-05-08 12:00+00','captured','Lily Mesa'],
      ['SW-2026-007','HV-1008','Spruce, 2m, Pine River',                '2026-05-09 15:30+00','captured','Karl Pine'],
      ['SW-2026-008',null,     'House eave, Lancaster PA (call-out)',   '2026-05-10 16:00+00','captured','Eli Heritage'],
      ['SW-2026-009','HV-1014','Birch, 3m, River Birch yard',           '2026-05-10 11:15+00','captured','Owen Birch'],
      ['SW-2026-010','HV-1006','Boulder field bush, Wildflower Acres',  '2026-05-11 10:30+00','captured','Tom Boulder'],
      ['SW-2026-011','HV-1009','Heritage barn rafters',                 '2026-05-11 14:45+00','captured','Eli Heritage'],
      ['SW-2026-012',null,     'Park bench, Madison WI (call-out)',     '2026-05-12 12:00+00','captured','Jane Lake'],
      ['SW-2026-013','HV-1015','Lake Country shed corner',              '2026-05-12 13:30+00','captured','Jane Lake'],
      ['SW-2026-014',null,     'Trash can, Williamsburg VA (call-out)', '2026-05-13 11:00+00','captured','Sam Tide'],
      ['SW-2026-015','HV-1010','Coastal yard cypress, 2m',              '2026-05-13 15:00+00','captured','Anna Coast'],
    ];
    for (const s of swarms) {
      await client.query(
        `INSERT INTO swarms (swarm_id,source_hive,location,caught_at,status,captured_by) VALUES ($1,$2,$3,$4,$5,$6)`,
        s
      );
    }

    console.log('[seed] inserting varroa_counts...');
    const varroa = [
      ['VC-2026-001','HV-1001', 1.2,'2026-05-10','monitoring','none'],
      ['VC-2026-002','HV-1002', 2.4,'2026-05-10','monitoring','recheck 7d'],
      ['VC-2026-003','HV-1003', 3.1,'2026-05-08','threshold','treat oxalic'],
      ['VC-2026-004','HV-1004', 1.0,'2026-05-12','monitoring','none'],
      ['VC-2026-005','HV-1005', 5.8,'2026-05-12','critical','treat apivar'],
      ['VC-2026-006','HV-1006', 2.0,'2026-05-09','monitoring','recheck 7d'],
      ['VC-2026-007','HV-1007', 1.6,'2026-05-11','monitoring','none'],
      ['VC-2026-008','HV-1008', 2.8,'2026-05-13','threshold','treat formic'],
      ['VC-2026-009','HV-1009', 6.2,'2026-05-07','critical','treat formic + recheck'],
      ['VC-2026-010','HV-1010', 7.5,'2026-05-06','critical','combine if not recoverable'],
      ['VC-2026-011','HV-1011', 1.4,'2026-05-14','monitoring','none'],
      ['VC-2026-012','HV-1012', 1.5,'2026-05-14','monitoring','none'],
      ['VC-2026-013','HV-1013', 4.0,'2026-05-05','threshold','treat oxalic vapor'],
      ['VC-2026-014','HV-1014', 2.2,'2026-05-11','monitoring','recheck 7d'],
      ['VC-2026-015','HV-1015', 5.1,'2026-05-09','critical','treat apiguard'],
    ];
    for (const v of varroa) {
      await client.query(
        `INSERT INTO varroa_counts (count_id,hive_id,mites_per_100_bees,sampled_at,status,action) VALUES ($1,$2,$3,$4,$5,$6)`,
        v
      );
    }

    console.log('[seed] inserting hive_sounds...');
    const sounds = [
      ['SND-2026-001','HV-1001','s3://hive-audio/ap001-hv1001-20260510.wav','2026-05-10 09:00+00','queenright',     0.92],
      ['SND-2026-002','HV-1002','s3://hive-audio/ap001-hv1002-20260510.wav','2026-05-10 09:15+00','queenright',     0.88],
      ['SND-2026-003','HV-1003','s3://hive-audio/ap002-hv1003-20260508.wav','2026-05-08 10:00+00','queenless_warble',0.81],
      ['SND-2026-004','HV-1004','s3://hive-audio/ap003-hv1004-20260512.wav','2026-05-12 11:00+00','queenright',     0.95],
      ['SND-2026-005','HV-1005','s3://hive-audio/ap003-hv1005-20260512.wav','2026-05-12 11:15+00','queenless',      0.87],
      ['SND-2026-006','HV-1006','s3://hive-audio/ap004-hv1006-20260509.wav','2026-05-09 12:00+00','queenright',     0.90],
      ['SND-2026-007','HV-1007','s3://hive-audio/ap005-hv1007-20260511.wav','2026-05-11 09:30+00','queenright',     0.93],
      ['SND-2026-008','HV-1008','s3://hive-audio/ap006-hv1008-20260513.wav','2026-05-13 10:00+00','queenright',     0.91],
      ['SND-2026-009','HV-1009','s3://hive-audio/ap007-hv1009-20260507.wav','2026-05-07 11:30+00','swarm_preparing',0.79],
      ['SND-2026-010','HV-1010','s3://hive-audio/ap008-hv1010-20260506.wav','2026-05-06 14:00+00','weak',           0.85],
      ['SND-2026-011','HV-1011','s3://hive-audio/ap009-hv1011-20260514.wav','2026-05-14 09:45+00','queenright',     0.94],
      ['SND-2026-012','HV-1012','s3://hive-audio/ap009-hv1012-20260514.wav','2026-05-14 10:00+00','queenright',     0.94],
      ['SND-2026-013','HV-1013','s3://hive-audio/ap010-hv1013-20260505.wav','2026-05-05 13:00+00','queenless_warble',0.82],
      ['SND-2026-014','HV-1014','s3://hive-audio/ap011-hv1014-20260511.wav','2026-05-11 12:30+00','queenright',     0.89],
      ['SND-2026-015','HV-1015','s3://hive-audio/ap012-hv1015-20260509.wav','2026-05-09 14:15+00','queenless',      0.86],
    ];
    for (const s of sounds) {
      await client.query(
        `INSERT INTO hive_sounds (sound_id,hive_id,recording_url,captured_at,classification,confidence) VALUES ($1,$2,$3,$4,$5,$6)`,
        s
      );
    }

    console.log('[seed] inserting audit_log...');
    const audit = [
      ['AUD-001','admin@apiary.io',     'apiaries:AP-001',        'create',  'success'],
      ['AUD-002','beekeeper@apiary.io', 'inspections:INSP-2026-005','create','success'],
      ['AUD-003','beekeeper@apiary.io', 'treatments:TRT-2026-001','create',  'success'],
      ['AUD-004','admin@apiary.io',     'pollination_contracts:POL-2026-001','create','success'],
      ['AUD-005','viewer@apiary.io',    'dashboard',              'read',    'success'],
      ['AUD-006','beekeeper@apiary.io', 'varroa_counts:VC-2026-009','create','success'],
      ['AUD-007','admin@apiary.io',     'customers:CUS-001',      'update',  'success'],
      ['AUD-008','beekeeper@apiary.io', 'honey_harvests:HARV-2026-011','create','success'],
      ['AUD-009','admin@apiary.io',     'webhook:apiary-notifier','create',  'success'],
      ['AUD-010','beekeeper@apiary.io', 'swarms:SW-2026-009',     'create',  'success'],
      ['AUD-011','admin@apiary.io',     'disease_outbreaks:DOB-2026-001','create','success'],
      ['AUD-012','beekeeper@apiary.io', 'hives:HV-1015',          'update',  'success'],
      ['AUD-013','admin@apiary.io',     'users:beekeeper@apiary.io','create','success'],
      ['AUD-014','beekeeper@apiary.io', 'hive_sounds:SND-2026-009','create', 'success'],
      ['AUD-015','viewer@apiary.io',    'ai:executive-brief',     'invoke',  'success'],
    ];
    for (const a of audit) {
      await client.query(
        `INSERT INTO audit_log (entry_id,actor,target,action,result) VALUES ($1,$2,$3,$4,$5)`,
        a
      );
    }

    // ─────────────────────────────────────────────
    // RBAC users (3)
    // ─────────────────────────────────────────────
    console.log('[seed] inserting users...');
    const users = [
      ['admin@apiary.io',     'admin123',     'Admin',     'admin'],
      ['beekeeper@apiary.io', 'beekeeper123', 'Beekeeper', 'beekeeper'],
      ['viewer@apiary.io',    'viewer123',    'Viewer',    'viewer'],
    ];
    for (const u of users) {
      await client.query(
        `INSERT INTO users (email,password,name,role) VALUES ($1,$2,$3,$4)`,
        u
      );
    }

    console.log('[seed] inserting notifications...');
    const notifications = [
      [1, 'Critical varroa load — HV-1010', 'Mite count 7.5/100 bees; immediate treatment needed', 'critical', 'varroa_counts'],
      [1, 'Disease outbreak — AFB at AP-005', 'American Foulbrood confirmed; quarantine apiary',     'critical', 'disease_outbreaks'],
      [1, 'Pesticide kill — AP-009',           'Possible exposure; sample hives for residue tests',  'critical', 'disease_outbreaks'],
      [2, 'Pollination contract starting',     'POL-2026-001 Almonds — 120 hives committed',         'high',     'pollination_contracts'],
      [2, 'Queen failing — HV-1015',           'Queenless warble detected; supersede or requeen',    'high',     'inspections'],
    ];
    for (const n of notifications) {
      await client.query(
        `INSERT INTO notifications (user_id,title,body,severity,source) VALUES ($1,$2,$3,$4,$5)`,
        n
      );
    }

    console.log('[seed] inserting webhooks...');
    const webhooks = [
      ['Apiary Outbreak Notifier', 'https://httpbin.org/post', 'sec_apiary_2026', 'disease_outbreaks.created,varroa_counts.created', true],
      ['Pollination Customer CRM', 'https://httpbin.org/post', 'sec_crm_2026',    'pollination_contracts.created',                   true],
    ];
    for (const w of webhooks) {
      await client.query(
        `INSERT INTO webhooks (name,url,secret,events,active) VALUES ($1,$2,$3,$4,$5)`,
        w
      );
    }

    console.log('[seed] complete.');
  } catch (e) {
    console.error('[seed] error:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();

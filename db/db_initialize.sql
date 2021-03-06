/* Create classificastion */

-- update classification chemical_uuid
-- classificationlist 업로드 후 chemical_uuid 매칭
-- update classificationlist set chemical_uuid = (select chem.uuid from chemical as chem where chem.chemidplus_id = classificationlist.chemidplus_id);
-- 위 쿼리가 오래걸려서 chemical table의 chemidplus_id를 primary로 잡아서 실행해봄.
-- 기존 테이블 복사 후 실행
-- chemidplus_id가 중복되지 않으니 primary key로 사용해도 무방할듯
CREATE TABLE chemical_temp
(
  uuid            TEXT,
  chemidplus_id   TEXT PRIMARY KEY,
  display_formula TEXT,
  display_name    TEXT
);

-- UPDATE classificationlist
-- SET chemical_uuid = (SELECT chem.uuid
--                      FROM chemical_temp AS chem
--                      WHERE chem.chemidplus_id = classificationlist.chemidplus_id);
-- 잘됨..

SELECT count(*)
FROM classificationlist;

SELECT
  chem.uuid,
  chem.display_name,
  chem.descriptor_name,
  chem.systematic_name,
  chem.name_substance,
  chem.chemidplus_id,
  chem.cas_registry_number,
  class.class_code,
  class.chemidplus_id,
  source.source
FROM chemical AS chem
  INNER JOIN classificationlist AS class ON chem.uuid = class.chemical_uuid
  INNER JOIN sourcelist AS source ON class.uuid = source.uuid
WHERE class.type = 'cc'
ORDER BY class.chemidplus_id

/* Create synonym in chemical table */

-- Name of substance, Systematic Name은 다수 존재로 chemical table에서 systematic_name, Name of substance 삭제, synonyms table에 type 추가
-- type은 sy: Synonym, sn:Systematic name, su:Substance Name
-- SQLite에서는 drop column 지원하지 않음 따라서 테이블 삭제 후 생성
CREATE TABLE chemical_for_sym
(
  uuid                TEXT PRIMARY KEY,
  chemidplus_id       TEXT,
  display_formula     TEXT,
  display_name        TEXT,
  descriptor_name     TEXT,
  cas_registry_number TEXT
);
-- INSERT INTO chemical_for_sym select uuid, chemidplus_id, display_formula, display_name, descriptor_name, cas_registry_number from chemical;
-- drop table chemical;
-- alter table chemical_for_sym RENAME TO chemical;


/* Create synonym data */

-- drop table synonyms;
-- CREATE TABLE synonyms
-- (
--   uuid          TEXT NOT NULL
--     PRIMARY KEY,
--   chemical_uuid TEXT NOT NULL
--     REFERENCES chemical,
--   name          TEXT,
--   type          TEXT NOT NULL
-- );


-- 임시synonyms_forxml에 xml data 로딩후 chemical_uuid 매칭
CREATE TABLE synonyms_forxml
(
  uuid          TEXT NOT NULL,
  chemical_uuid TEXT NOT NULL,
  name          TEXT,
  type          TEXT NOT NULL,
  chemidplus_id TEXT NOT NULL
);

-- convert_chemidplusxml_database_synonym.js 실행

SELECT
  sf.uuid,
  sf.name,
  sf.type,
  source.source
FROM synonyms_forxml sf
  INNER JOIN sourcelist source ON sf.uuid = source.uuid
WHERE source.code = 'na';

-- check type column whether is null
-- select * from synonyms_forxml where type is null;

-- synonym 관련 데이터 삭제
-- delete from sourcelist where uuid  in (select uuid from synonyms_forxml);
-- delete from synonyms_forxml;
SELECT *
FROM synonyms_forxml;

-- update chemical_uuid at synonyms table
-- UPDATE synonyms_forxml
-- SET chemical_uuid = (SELECT chem.uuid
--                      FROM chemical_temp AS chem
--                      WHERE chem.chemidplus_id = synonyms_forxml.chemidplus_id);

-- move data from a synonyms_forxml to a synonyms table
-- INSERT INTO synonyms(uuid, chemical_uuid, name, type) select uuid, chemical_uuid, name, type from synonyms_forxml;
-- check if data that type is null exists. If it is, then check data
-- select * from synonyms where type is null;
-- drop temporary table
DROP TABLE synonyms_forxml;


/* Create formular data */

-- 1. formular 임시 table 생성
DROP TABLE formula_forxml;
CREATE TABLE formula_forxml (
  uuid          TEXT NOT NULL PRIMARY KEY,
  type          TEXT NOT NULL, -- ff: FormulaFragmentList, mf: MolecularFormula
  chemical_uuid TEXT NOT NULL,
  formula       TEXT,
  chemidplus_id TEXT
);
-- select
-- select * from formula_forxml;

-- 2. convert_chemidplusxml_database_formular.js 실행

-- cleansing if error exists
-- delete from sourcelist where uuid in (select uuid from formula_forxml);
-- delete from formula_forxml;

-- 3. update chemical_uuid at formular_forxml
-- UPDATE formula_forxml
-- SET chemical_uuid = (SELECT chem.uuid
--                      FROM chemical_temp AS chem
--                      WHERE chem.chemidplus_id = formula_forxml.chemidplus_id);

-- 4. copy the data in formular_forxml table to a formular table.
-- INSERT INTO formula(uuid, type, chemical_uuid, formula) select uuid, type, chemical_uuid, formula from formula_forxml;
-- select count(*) from formula;
-- 5. drop table formula_forxml;
drop table formula_forxml;

/* Create NumberList data */
-- 1. numberList 임시 table 생성
DROP TABLE numberList_forxml;
CREATE TABLE numberList_forxml (
  uuid            TEXT NOT NULL PRIMARY KEY,
  chemical_uuid   TEXT NOT NULL,
  type            TEXT NOT NULL, -- cn: CASRegistryNumber, in : IdentificationNumber, on : OtherRegistryNumber, rn : RelatedRegistryNumber
  registry_number TEXT,
  chemidplus_id   TEXT
);

-- select
SELECT count(distinct chemidplus_id)
FROM numberList_forxml;

-- 2. convert_chemidplusxml_database_numberlist.js 실행

-- cleansing if error exists
DELETE FROM sourcelist
WHERE uuid IN (SELECT uuid
               FROM numberList_forxml);
DELETE FROM numberList_forxml;

-- 3. update chemical_uuid at formular_forxml
UPDATE numberList_forxml
SET chemical_uuid = (SELECT chem.uuid
                     FROM chemical_temp AS chem
                     WHERE chem.chemidplus_id = numberList_forxml.chemidplus_id);

-- 4. copy the data in formular_forxml table to a formular table.
-- INSERT INTO numberlist (uuid, chemical_uuid, type, registry_number, chemidplus_id) SELECT
--                                                                                      uuid,
--                                                                                      chemical_uuid,
--                                                                                      type,
--                                                                                      registry_number,
--                                                                                      chemidplus_id
--                                                                                    FROM numberList_forxml;

-- 5. drop temporary table numberList_forxml
-- DROP TABLE numberList_forxml;

/* Create Locatorlist data */
-- 1. Locatorlist 임시 table 생성
-- DROP TABLE locatorlist_forxml;
CREATE TABLE locatorlist_forxml
(
  uuid          TEXT NOT NULL
    PRIMARY KEY,
  chemical_uuid TEXT NOT NULL,
  type          TEXT, -- {'FileLocator':'fl', 'InternetLocator':'il', 'SuperlistLocator':'sl'}
  url           TEXT,
  name          TEXT,
  chemidplus_id TEXT
);

-- select
SELECT *
FROM locatorlist_forxml;

-- 2. convert_chemidplusxml_database_locatorlist.js 실행
-- cleansing if error exists
-- delete from locatorlist_forxml;

-- 3. update chemical_uuid at locatorlist_forxml
UPDATE locatorlist_forxml
SET chemical_uuid = (SELECT chem.uuid
                     FROM chemical_temp AS chem
                     WHERE chem.chemidplus_id = locatorlist_forxml.chemidplus_id);

-- 4. copy the data in locatorlist_forxml table to a locatorlist table.
INSERT INTO locatorlist (uuid, chemical_uuid, type, url, name, chemidplus_id) SELECT
                                                                                uuid,
                                                                                chemical_uuid,
                                                                                type,
                                                                                url,
                                                                                name,
                                                                                chemidplus_id
                                                                              FROM locatorlist_forxml;

-- 5. drop temporary table
DROP TABLE locatorlist_forxml;


/* Create notelist data */
-- 1. notelist 임시 table 생성
DROP TABLE notelist_forxml;
CREATE TABLE notelist_forxml (
  uuid            TEXT NOT NULL PRIMARY KEY ,
  chemical_uuid  TEXT NOT NULL,
  note            TEXT,
  type            TEXT,
  chemidplus_id   TEXT
);

-- select
SELECT *
FROM notelist_forxml;

-- 2. convert_chemidplusxml_database_notelist.js 실행

-- cleansing if error exists
-- delete from sourcelist where uuid  in (select uuid from notelist_forxml);
-- delete from notelist_forxml;

-- 3. update chemical_uuid at notelist_forxml
UPDATE notelist_forxml
SET chemical_uuid = (SELECT chem.uuid
                     FROM chemical_temp AS chem
                     WHERE chem.chemidplus_id = notelist_forxml.chemidplus_id);

-- 4. copy the data in notelist_forxml table to a notelist table.
INSERT INTO notelist (uuid, chemical_uuid, note, type, chemidplus_id) SELECT
                                                                        uuid,
                                                                        chemical_uuid,
                                                                        note,
                                                                        type,
                                                                        chemidplus_id
                                                                      FROM notelist_forxml;
-- 5. drop temporary table (notelist_forxml)
-- DROP TABLE notelist_forxml;

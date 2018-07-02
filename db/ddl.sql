DROP TABLE chemical;
CREATE TABLE chemical (
  uuid                  TEXT NOT NULL PRIMARY KEY,
  chemidplus_id         TEXT,
  display_formula       TEXT,
  display_name          TEXT,
  descriptor_name       TEXT,
  name_substance        TEXT,
  cas_registry_number   TEXT
);

CREATE TABLE classificationlist (
  uuid            TEXT NOT NULL PRIMARY KEY ,
  chemical_uuid   TEXT NOT NULL,
  class_code      TEXT,
  type            TEXT,
  FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
);

DROP TABLE locatorlist;
CREATE TABLE locatorlist (
  uuid            TEXT NOT NULL PRIMARY KEY ,
  chemical_uuid   TEXT NOT NULL,
  type            TEXT,
  url             TEXT,
  name            TEXT,
  chemidplus_id   TEXT,
  FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
);

-- molecularformula, formulaframentlist 대체
CREATE TABLE formula (
  uuid                TEXT NOT NULL PRIMARY KEY ,
  type                TEXT NOT NULL, -- ff: FormulaFragmentList, mf: MolecularFormula
  chemical_uuid       TEXT NOT NULL,
  formula   TEXT,
  FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
);

-- CREATE TABLE molecularformula (
--     uuid                TEXT NOT NULL PRIMARY KEY ,
--     chemical_uuid       TEXT NOT NULL,
--     molecular_formula   TEXT,
--     FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
-- );

-- CREATE TABLE formulafragmentlist (
--     uuid                TEXT NOT NULL PRIMARY KEY ,
--     chemical_uuid       TEXT NOT NULL,
--     formular_fragment   TEXT,
--     FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
-- );

drop table notelist;
CREATE TABLE notelist (
  uuid            TEXT NOT NULL PRIMARY KEY ,
  chemical_uuid   TEXT NOT NULL,
  note            TEXT,
  type            TEXT,
  chemidplus_id   TEXT,
  FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
);

CREATE TABLE numberlist (
  uuid            TEXT NOT NULL PRIMARY KEY,
  chemical_uuid   TEXT NOT NULL,
  type            TEXT NOT NULL, -- cn: CASRegistryNumber, in : IdentificationNumber, on : OtherRegistryNumber, rn : RelatedRegistryNumber
  registry_number TEXT,
  chemidplus_id   TEXT,
  FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
);

DROP TABLE sourcelist;
CREATE TABLE sourcelist (
  uuid     TEXT NOT NULL ,
  code     TEXT NOT NULL ,
  source   TEXT
);

CREATE TABLE synonyms (
  uuid            TEXT NOT NULL PRIMARY KEY,
  chemical_uuid   TEXT NOT NULL,
  type   TEXT NOT NULL,
  name            TEXT,
  FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
);

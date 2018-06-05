CREATE TABLE chemical (
    uuid                  TEXT NOT NULL PRIMARY KEY,
    display_formula       TEXT,
    display_name          TEXT,
    systematic_name       TEXT,
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

CREATE TABLE formulafragmentlist (
    uuid                TEXT NOT NULL PRIMARY KEY ,
    chemical_uuid       TEXT NOT NULL,
    formular_fragment   TEXT,
    FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
);


CREATE TABLE locatorlist (
    uuid            TEXT NOT NULL PRIMARY KEY ,
    chemical_uuid   TEXT NOT NULL,
    type            TEXT,
    url             TEXT,
    name            TEXT,
    FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
);

CREATE TABLE molecularformula (
    uuid                TEXT NOT NULL PRIMARY KEY ,
    chemical_uuid       TEXT NOT NULL,
    molecular_formula   TEXT,
    FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
);

CREATE TABLE notelist (
    uuid            TEXT NOT NULL PRIMARY KEY ,
    chemical_uuid   TEXT NOT NULL,
    note            TEXT,
    FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
);

CREATE TABLE othernumberlist (
    uuid                      TEXT NOT NULL PRIMARY KEY,
    chemical_uuid             TEXT NOT NULL,
    related_registry_number   TEXT,
    other_registry_number     TEXT,
    FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
);

CREATE TABLE sourcelist (
    uuid     TEXT NOT NULL ,
    code     TEXT NOT NULL ,
    source   TEXT,
    PRIMARY KEY (uuid, code)
);

CREATE TABLE synonyms (
    uuid            TEXT NOT NULL PRIMARY KEY,
    chemical_uuid   TEXT NOT NULL,
    name            TEXT,
    FOREIGN KEY(chemical_uuid) REFERENCES chemical(uuid)
);
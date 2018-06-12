-- update classification chemical_uuid
-- classificationlist 업로드 후 chemical_uuid 매칭
update classificationlist set chemical_uuid = (select chem.uuid from chemical as chem where chem.chemidplus_id = classificationlist.chemidplus_id);


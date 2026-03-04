---
title: IFRS9 Tech Web Spec v2.0
description: Converted technical web specification from Excel into structured FSD documentation
---

# IFRS9 Tech Web Specification v2.0

_Last generated: 2026-02-15_

## Source Artifacts

- Excel Source: [/specs/ifrs9-tech-web-spec-v2-0.xlsx](/specs/ifrs9-tech-web-spec-v2-0.xlsx)
- PDF Export: [/specs/ifrs9-tech-web-spec-v2-0.pdf](/specs/ifrs9-tech-web-spec-v2-0.pdf)

## Coverage Summary

- Total screens mapped: **54**
- Sections:
  - IFRS 9: 16
  - Collective Impairment: 11
  - Individual Impairment: 8
  - Maintenance: 6
  - Reporting: 5
  - Custom Reports: 2
  - License UI &amp; Framework: 2
  - Parameter Setup: 2
  - History -&gt; Collateral: 1
  - Tools: 1

## Screen Specifications

### 1. Application Setting  / Business Setting

- Section: **License UI &amp; Framework**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/ApplicationSetting`
- Source Reference: `_sources/ifrs9/Views/ApplicationSetting`
- Legacy Menu: Configuration=&gt;Application Settings / (https://psak413.ifrspro.id/configuration/application-settings)
- Primary Table: `FRS9_PARAM_COMMONH`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_PARAM_COMMONH | PKID |  |  |  |
| FRS9_PARAM_COMMONH | PARAM_CODE * |  |  |  |
| FRS9_PARAM_COMMONH | PARAM_NAME |  |  |  |
| FRS9_PARAM_COMMONH | PARAM_USAGE |  |  |  |
| FRS9_PARAM_COMMONH | PARAM_TYPE |  |  |  |
| FRS9_PARAM_COMMONH | CREATEDBY |  |  |  |
| FRS9_PARAM_COMMONH | CREATEDDATE |  |  |  |
| FRS9_PARAM_COMMONH | CREATEDHOST |  |  |  |
| FRS9_PARAM_COMMONH | UPDATEDBY |  |  |  |
| FRS9_PARAM_COMMONH | UPDATEDDATE |  |  |  |
| FRS9_PARAM_COMMONH | UPDATEDHOST |  |  |  |

### 2. BussinessSetting

- Section: **License UI &amp; Framework**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/BussinessSetting`
- Source Reference: `_sources/ifrs9/Views/BusinessSetting`
- Legacy Menu: Configuration=&gt;Business Settings / (https://psak413.ifrspro.id/config/business)
- Primary Table: `FRS9_PARAM_COMMOND`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_PARAM_COMMOND | PKID |  |  |  |
| FRS9_PARAM_COMMOND | PARAM_CODE * |  |  |  |
| FRS9_PARAM_COMMOND | PARAM_SEQ * |  |  |  |
| FRS9_PARAM_COMMOND | VALUE1 |  |  |  |
| FRS9_PARAM_COMMOND | VALUE2 |  |  |  |
| FRS9_PARAM_COMMOND | VALUE3 |  |  |  |
| FRS9_PARAM_COMMOND | PARAMDESC |  |  |  |
| FRS9_PARAM_COMMOND | CREATEDBY |  |  |  |
| FRS9_PARAM_COMMOND | CREATEDDATE |  |  |  |
| FRS9_PARAM_COMMOND | CREATEDHOST |  |  |  |
| FRS9_PARAM_COMMOND | UPDATEDBY |  |  |  |
| FRS9_PARAM_COMMOND | UPDATEDDATE |  |  |  |
| FRS9_PARAM_COMMOND | UPDATEDHOST |  |  |  |

### 3. Product Parameter

- Section: **Parameter Setup**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/ProductParameter`
- Source Reference: `_sources/ifrs9/Views/ProductParameter`
- Legacy Menu: Parameter Configuration=&gt;Product Parameters  / (https://psak413.ifrspro.id/config/params/product)
- Primary Table: `FRS9_PARAM_PRODUCT`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_PARAM_PRODUCT | PKID |  |  |  |
| FRS9_PARAM_PRODUCT | DATA_SOURCE * | Data Source | Combo Box (Business Setting 'B0028') | Added to close tech spec gap for controlled values |
| FRS9_PARAM_PRODUCT | PRD_GROUP * | Product Group | Combo Box (Business Setting 'B0029') | Added to close tech spec gap for controlled values |
| FRS9_PARAM_PRODUCT | PRD_TYPE * | Product Type | Combo Box (Business Setting 'B0030') | Added to close tech spec gap for controlled values |
| FRS9_PARAM_PRODUCT | PRD_CODE * | Product Code |  |  |
| FRS9_PARAM_PRODUCT | PRD_DESC | Product Desc |  |  |
| FRS9_PARAM_PRODUCT | CURRENCY * | Currency | Combo Box (Business Setting 'B0001') |  |
| FRS9_PARAM_PRODUCT | AMORTIZATION_TYPE | Amortization Type | Combo Box (Business Setting 'B0002') |  |
| FRS9_PARAM_PRODUCT | AL_FLAG * | Instrument Class | Combo Box (Business Setting 'B0003') |  |
| FRS9_PARAM_PRODUCT | IMPAIRED_FLAG | Impaired Flag | Check box |  |
| FRS9_PARAM_PRODUCT | BM_FLAG | Below Market Flag | Check box |  |
| FRS9_PARAM_PRODUCT | EXPECTED_LIFE | Expected Life | Number Text Box |  |
| FRS9_PARAM_PRODUCT | BORROWING_RATE | Borrowing Rate | Number Text Box |  |
| FRS9_PARAM_PRODUCT | MARKET_RATE | Market Rate | Number Text Box |  |
| FRS9_PARAM_PRODUCT | ACTIVE_FLAG | Is Active | Check box |  |
| FRS9_PARAM_PRODUCT | CREATEDBY |  |  |  |
| FRS9_PARAM_PRODUCT | CREATEDDATE |  |  |  |
| FRS9_PARAM_PRODUCT | CREATEDHOST |  |  |  |
| FRS9_PARAM_PRODUCT | UPDATEDBY |  |  |  |
| FRS9_PARAM_PRODUCT | UPDATEDDATE |  |  |  |
| FRS9_PARAM_PRODUCT | UPDATEDHOST |  |  |  |

### 4. Journal Parameter

- Section: **Parameter Setup**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/JournalParameter`
- Source Reference: `_sources/ifrs9/Views/JournalParameter`
- Legacy Menu: Parameter Configuration=&gt;Journal Parameters  / (https://psak413.ifrspro.id/config/params/journal)
- Primary Table: `FRS9_PARAM_JOURNAL`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_PARAM_JOURNAL | PKID |  |  |  |
| FRS9_PARAM_JOURNAL | GL_GROUP * | Journal Group | Combo Box (ambil dari rule based setting rule type = 'GL') |  |
| FRS9_PARAM_JOURNAL | CURRENCY * | Currency | Combo Box (Business Setting 'B0001') |  |
| FRS9_PARAM_JOURNAL | GL_TYPE * | Journal Type | Combo Box (Business Setting 'B0005') |  |
| FRS9_PARAM_JOURNAL | GL_CODE * | Journal Code | Combo Box (Business Setting 'B0006') |  |
| FRS9_PARAM_JOURNAL | GL_NUMBER | COA | Text Box |  |
| FRS9_PARAM_JOURNAL | DBCR * | DB/CR | Combo Box (Business Setting 'B0007') |  |
| FRS9_PARAM_JOURNAL | GL_DESC | Journal Desc | Text Box |  |
| FRS9_PARAM_JOURNAL | ACTIVE_FLAG | Is Active | Check box |  |
| FRS9_PARAM_JOURNAL | CREATEDBY |  |  |  |
| FRS9_PARAM_JOURNAL | CREATEDDATE |  |  |  |
| FRS9_PARAM_JOURNAL | CREATEDHOST |  |  |  |
| FRS9_PARAM_JOURNAL | UPDATEDBY |  |  |  |
| FRS9_PARAM_JOURNAL | UPDATEDDATE |  |  |  |
| FRS9_PARAM_JOURNAL | UPDATEDHOST |  |  |  |

### 5. Segmentation Management

- Section: **Collective Impairment**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/ParamSegment`
- Source Reference: `_sources/ifrs9/Views/ParamSegment`
- Legacy Menu: Parameter Configuration=&gt;Segmentation Parameters  / (https://psak413.ifrspro.id/config/params/segmentation)
- Primary Table: `FRS9_PARAM_SEGMENTH`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_PARAM_SEGMENTH | PKID |  |  |  |
| FRS9_PARAM_SEGMENTH | GROUP_SEGMENT * | Group Segment | Text Box |  |
| FRS9_PARAM_SEGMENTH | SEGMENT * | Segment | Text Box |  |
| FRS9_PARAM_SEGMENTH | SUB_SEGMENT * | Sub Segment | Text Box |  |
| FRS9_PARAM_SEGMENTH | SEGMENT_TYPE * | Segment Type | Combo Box (Business Setting 'B0011') |  |
| FRS9_PARAM_SEGMENTH | SEQ | Sequence | Number Text Box |  |
| FRS9_PARAM_SEGMENTH | ACTIVE_FLAG | Is Active | Check Box |  |
| FRS9_PARAM_SEGMENTH | CREATEDBY |  |  |  |
| FRS9_PARAM_SEGMENTH | CREATEDDATE |  |  |  |
| FRS9_PARAM_SEGMENTH | CREATEDHOST |  |  |  |
| FRS9_PARAM_SEGMENTH | UPDATEDBY |  |  |  |
| FRS9_PARAM_SEGMENTH | UPDATEDDATE |  |  |  |
| FRS9_PARAM_SEGMENTH | UPDATEDHOST |  |  |  |
| FRS9_PARAM_SEGMENTD | PKID |  |  |  |
| FRS9_PARAM_SEGMENTH | SEGMENT_ID |  | PKID Header |  |
| FRS9_PARAM_SEGMENTH | QUERY_GROUP | Query Grouping | Number Text Box |  |
| FRS9_PARAM_SEGMENTH | SEQ | Sequence | Number Text Box |  |
| FRS9_PARAM_SEGMENTH | TABLE_NAME | Table Name | Combo Box (Business Setting B0012) |  |
| FRS9_PARAM_SEGMENTH | COLUMN_NAME | Column Name | Combo Box (Business Setting -&gt;distinct(VALUE1) where VALUE3 = selected TABLE_NAME ) |  |
| FRS9_PARAM_SEGMENTH | 2 | Data Type | Text Label, Business Setting B0013-&gt;distinct(VALUE2) Where Value 1 = selected Column Name and VALUE3 = selected TABLE_NAME |  |
| FRS9_PARAM_SEGMENTH | OPERATOR | Operator | Combo Box (Busimess Setting B0014-&gt;Distinct Value1 where Value2 = Selected Data Type) / Varchar (IN, NOT IN, LIKE, NOT LIKE)  / Number (=,&gt;,&lt;,&gt;=,&lt;=,&lt;&gt;,BETWEEN)  / Date (=,&gt;,&lt;,&gt;=,&lt;=,&lt;&gt;,BETWEEN)  / Boolean (=) |  |
| FRS9_PARAM_SEGMENTH | VALUE1 | Value Start | Varchar (IN, NOT IN) -&gt; Multiple Selected Combo Box (Business Setting B0016-&gt;Distinct Value1 where Value2 = selected Column Name and VALUE3 = selected TABLE_NAME) / Varchar (LIKE, NOT LIKE) -&gt; Text Box / Number (=,&gt;,&lt;,&gt;=,&lt;=,&lt;&gt;) -&gt; Number Text Box  / Number (BETWEEN) -&gt; Number Text Box / Date (=,&gt;,&lt;,&gt;=,&lt;=,&lt;&gt;) -&gt; Date Picker  / Date (BETWEEN) -&gt; Date Picker / Boolean -&gt; Option Button (1=True/0=False) |  |
| FRS9_PARAM_SEGMENTH | VALUE2 | Value End | Date (BETWEEN) -&gt; Date Picker  / Number (BETWEEN) -&gt; Number Text Box |  |
| FRS9_PARAM_SEGMENTH | CONDITION | Condition | Combo Box (Business Setting B15-&gt; Distinct Value1) |  |
| FRS9_PARAM_SEGMENTH | CREATEDBY |  |  |  |
| FRS9_PARAM_SEGMENTH | CREATEDDATE |  |  |  |
| FRS9_PARAM_SEGMENTH | CREATEDHOST |  |  |  |
| FRS9_PARAM_SEGMENTH | UPDATEDBY |  |  |  |
| FRS9_PARAM_SEGMENTH | UPDATEDDATE |  |  |  |
| FRS9_PARAM_SEGMENTH | UPDATEDHOST |  |  |  |

### 6. Bucket Management

- Section: **Collective Impairment**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/ParamScenarioRules`
- Source Reference: `_sources/ifrs9/Views/ParamBucket`
- Legacy Menu: Parameter Configuration=&gt;Parameter Buckets  / (https://psak413.ifrspro.id/config/params/buckets)
- Primary Table: `FRS9_PARAM_BUCKETH`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_PARAM_BUCKETH | PKID |  |  |  |
| FRS9_PARAM_BUCKETH | BUCKET_GROUP * | Bucket Group ID | Text Box |  |
| FRS9_PARAM_BUCKETH | BUCKET_DESC | Bucket Group Description | Text Box |  |
| FRS9_PARAM_BUCKETH | BASIS | Basis | Combo Box (Business Setting B0017) |  |
| FRS9_PARAM_BUCKETH | BUCKET_DEFAULT | Default Bucket | Number Text Box |  |
| FRS9_PARAM_BUCKETH | CLOSED_FLAG | Include Closed | Check Box |  |
| FRS9_PARAM_BUCKETH | WO_FLAG | Include WO | Check Box |  |
| FRS9_PARAM_BUCKETH | CREATEDBY |  |  |  |
| FRS9_PARAM_BUCKETH | CREATEDDATE |  |  |  |
| FRS9_PARAM_BUCKETH | CREATEDHOST |  |  |  |
| FRS9_PARAM_BUCKETH | UPDATEDBY |  |  |  |
| FRS9_PARAM_BUCKETH | UPDATEDDATE |  |  |  |
| FRS9_PARAM_BUCKETH | UPDATEDHOST |  |  |  |
| FRS9_PARAM_BUCKETD | PKID |  |  |  |
| FRS9_PARAM_BUCKETH | PKID_HEADER |  | PKID Header |  |
| FRS9_PARAM_BUCKETH | BUCKET_ID | Bucket ID | Number Auto Generated, start from 1 per PKID_HEADER |  |
| FRS9_PARAM_BUCKETH | BUCKET_NAME | Bucket Name | Text Box |  |
| FRS9_PARAM_BUCKETH | RANGE_START | Start | Number Text Box |  |
| FRS9_PARAM_BUCKETH | RANGE_END | End | Number Text Box |  |
| FRS9_PARAM_BUCKETH | CREATEDBY |  |  |  |
| FRS9_PARAM_BUCKETH | CREATEDDATE |  |  |  |
| FRS9_PARAM_BUCKETH | CREATEDHOST |  |  |  |
| FRS9_PARAM_BUCKETH | UPDATEDBY |  |  |  |
| FRS9_PARAM_BUCKETH | UPDATEDDATE |  |  |  |
| FRS9_PARAM_BUCKETH | UPDATEDHOST |  |  |  |

### 7. SICR Management  / Rule Based Setting

- Section: **Collective Impairment**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/ParamBucket`
- Source Reference: `_sources/ifrs9/Views/ParamBucket_sources/ifrs9/Views/ParamScenarioRules`
- Legacy Menu: Parameter Configuration=&gt;Scenario Rules  / (https://psak413.ifrspro.id/config/params/scenario-rules)
- Primary Table: `FRS9_PARAM_SCENARIO_RULESH`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_PARAM_SCENARIO_RULESH | PKID |  |  |  |
| FRS9_PARAM_SCENARIO_RULESH | RULE_NAME | Rule Name |  |  |
| FRS9_PARAM_SCENARIO_RULESH | RULE_TYPE | Rule Type | Combo Box (Business Setting B0008) |  |
| FRS9_PARAM_SCENARIO_RULESH | UPDATED_TABLE | Updated Table | Combo Box (Business Setting B0009) |  |
| FRS9_PARAM_SCENARIO_RULESH | UPDATED_COLUMN | Updated Column | Combo Box (Business Setting B0010) |  |
| FRS9_PARAM_SCENARIO_RULESH | VALUE | Value |  |  |
| FRS9_PARAM_SCENARIO_RULESH | SEQ | Sequence | Number Text Box |  |
| FRS9_PARAM_SCENARIO_RULESH | ACTIVE_FLAG | Is Active | Check Box |  |
| FRS9_PARAM_SCENARIO_RULESH | CREATEDBY |  |  |  |
| FRS9_PARAM_SCENARIO_RULESH | CREATEDDATE |  |  |  |
| FRS9_PARAM_SCENARIO_RULESH | CREATEDHOST |  |  |  |
| FRS9_PARAM_SCENARIO_RULESH | UPDATEDBY |  |  |  |
| FRS9_PARAM_SCENARIO_RULESH | UPDATEDDATE |  |  |  |
| FRS9_PARAM_SCENARIO_RULESH | UPDATEDHOST |  |  |  |
| FRS9_PARAM_SCENARIO_RULESD | PKID |  |  |  |
| FRS9_PARAM_SCENARIO_RULESH | RULE_ID |  | PKID Header |  |
| FRS9_PARAM_SCENARIO_RULESH | QUERY_GROUP | Query Grouping | Number Text Box |  |
| FRS9_PARAM_SCENARIO_RULESH | SEQ | Sequence | Number Text Box |  |
| FRS9_PARAM_SCENARIO_RULESH | TABLE_NAME | Table Name | Combo Box (Business Setting B0012) |  |
| FRS9_PARAM_SCENARIO_RULESH | COLUMN_NAME | Column Name | Combo Box (Business Setting B0013 -&gt;distinct(VALUE1) where VALUE3 = selected TABLE_NAME ) |  |
| FRS9_PARAM_SCENARIO_RULESH | DATA_TYPE | Data Type | Text Label, Business Setting B0013-&gt;distinct(VALUE2) Where Value 1 = selected Column Name and VALUE3 = selected TABLE_NAME |  |
| FRS9_PARAM_SCENARIO_RULESH | OPERATOR | Operator | Combo Box (Busimess Setting B0014-&gt;Distinct Value1 where Value2 = Selected Data Type) / Varchar (IN, NOT IN, LIKE, NOT LIKE)  / Number (=,&gt;,&lt;,&gt;=,&lt;=,&lt;&gt;,BETWEEN)  / Date (=,&gt;,&lt;,&gt;=,&lt;=,&lt;&gt;,BETWEEN)  / Boolean (=) |  |
| FRS9_PARAM_SCENARIO_RULESH | VALUE1 | Value Start | Varchar (IN, NOT IN) -&gt; Multiple Selected Combo Box (Business Setting B0016-&gt;Distinct Value1 where Value2 = selected Column Name and VALUE3 = selected TABLE_NAME) / Varchar (LIKE, NOT LIKE) -&gt; Text Box / Number (=,&gt;,&lt;,&gt;=,&lt;=,&lt;&gt;) -&gt; Number Text Box  / Number (BETWEEN) -&gt; Number Text Box / Date (=,&gt;,&lt;,&gt;=,&lt;=,&lt;&gt;) -&gt; Date Picker  / Date (BETWEEN) -&gt; Date Picker / Boolean -&gt; Option Button (1=True/0=False) |  |
| FRS9_PARAM_SCENARIO_RULESH | VALUE2 | Value End | Date (BETWEEN) -&gt; Date Picker  / Number (BETWEEN) -&gt; Number Text Box |  |
| FRS9_PARAM_SCENARIO_RULESH | CONDITION | Condition | Combo Box (Business Setting B15-&gt; Distinct Value1) |  |
| FRS9_PARAM_SCENARIO_RULESH | DETAIL_TYPE | Detail Type | Number Text Box |  |
| FRS9_PARAM_SCENARIO_RULESH | STAGE_FROM | Stage From | Number Text Box |  |
| FRS9_PARAM_SCENARIO_RULESH | STAGE_TO | Stage To | Number Text Box |  |
| FRS9_PARAM_SCENARIO_RULESH | CREATEDBY |  |  |  |
| FRS9_PARAM_SCENARIO_RULESH | CREATEDDATE |  |  |  |
| FRS9_PARAM_SCENARIO_RULESH | CREATEDHOST |  |  |  |
| FRS9_PARAM_SCENARIO_RULESH | UPDATEDBY |  |  |  |
| FRS9_PARAM_SCENARIO_RULESH | UPDATEDDATE |  |  |  |
| FRS9_PARAM_SCENARIO_RULESH | UPDATEDHOST |  |  |  |

### 8. PD Setup Management

- Section: **Collective Impairment**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/PDConfig`
- Source Reference: `_sources/ifrs9/Views/PDConfig`
- Legacy Menu: Model Configuration=&gt;PD Configuration  / (https://psak413.ifrspro.id/config/model/pd)
- Primary Table: `FRS9_IMP_CA_PD_CONFIG`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_CA_PD_CONFIG | PKID |  |  |  |
| FRS9_IMP_CA_PD_CONFIG | PD_MODEL_NAME * | Model Name | Text Box |  |
| FRS9_IMP_CA_PD_CONFIG | SEGMENT_ID | Population Segment | Combo Box (ambil dari segmentation configuration header, segment type = 'PD') |  |
| FRS9_IMP_CA_PD_CONFIG | PD_METHOD | Selected Method | Combo Box (Business Setting B0018) |  |
| FRS9_IMP_CA_PD_CONFIG | INTERVAL | Migration Interval | Number Text Box (Disable jika PD_METHOD = 3) |  |
| FRS9_IMP_CA_PD_CONFIG | POPULATION_TYPE | Population Type | Combo Box (Business Setting B0019) - Disable jika PD_METHOD = '3' |  |
| FRS9_IMP_CA_PD_CONFIG | OBSERVATION_PERIOD | Historical Month | Number Text Box (Disable jika PD_METHOD = 3) |  |
| FRS9_IMP_CA_PD_CONFIG | OBSERVATION_START_DATE | First Historical Date | Date Picker (Disable jika PD_METHOD = 3) |  |
| FRS9_IMP_CA_PD_CONFIG | MULTIPLICATION | Multiplication | Number Text Box (Disable jika PD_METHOD = 3) |  |
| FRS9_IMP_CA_PD_CONFIG | FL_FLAG | FL Flag | Check box |  |
| FRS9_IMP_CA_PD_CONFIG | FL_SCALAR_ID | FL Scalar | Combo Box (Ambil dari Master FL Scalar), Enable jika FL FLAG = 1 |  |
| FRS9_IMP_CA_PD_CONFIG | IA_FLAG | IA Flag | Check box |  |
| FRS9_IMP_CA_PD_CONFIG | BUCKET_GROUP | Bucket | Combo Box (Ambil dari bucket header) |  |
| FRS9_IMP_CA_PD_CONFIG | ACTIVE_FLAG | Is Active | Check box |  |
| FRS9_IMP_CA_PD_CONFIG | CREATEDBY |  |  |  |
| FRS9_IMP_CA_PD_CONFIG | CREATEDDATE |  |  |  |
| FRS9_IMP_CA_PD_CONFIG | CREATEDHOST |  |  |  |
| FRS9_IMP_CA_PD_CONFIG | UPDATEDBY |  |  |  |
| FRS9_IMP_CA_PD_CONFIG | UPDATEDDATE |  |  |  |
| FRS9_IMP_CA_PD_CONFIG | UPDATEDHOST |  |  |  |

### 9. FL Scalar

- Section: **Collective Impairment**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/FLScalar`
- Source Reference: `_sources/ifrs9/Views/FLScalar`
- Legacy Menu: Parameter Configuration=&gt;Scalar Configuration / (https://psak413.ifrspro.id/config/params/scalar)
- Primary Table: `FRS9_IMP_CA_FL_SCALARH`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_CA_FL_SCALARH | PKID |  |  |  |
| FRS9_IMP_CA_FL_SCALARH | SCALAR NAME * | Scalar Name | Text Box |  |
| FRS9_IMP_CA_FL_SCALARH | ACTIVE_FLAG | Is Active | Check box |  |
| FRS9_IMP_CA_FL_SCALARH | CREATEDBY |  |  |  |
| FRS9_IMP_CA_FL_SCALARH | CREATEDDATE |  |  |  |
| FRS9_IMP_CA_FL_SCALARH | CREATEDHOST |  |  |  |
| FRS9_IMP_CA_FL_SCALARH | UPDATEDBY |  |  |  |
| FRS9_IMP_CA_FL_SCALARH | UPDATEDDATE |  |  |  |
| FRS9_IMP_CA_FL_SCALARH | UPDATEDHOST |  |  |  |

### 10. Parameter Configuration=&gt;Forward-Looking Scalars

- Section: **Collective Impairment**
- Legacy Menu: Parameter Configuration=&gt;Forward-Looking Scalars / (https://psak413.ifrspro.id/config/params/fl-scalar)
- Primary Table: `FRS9_IMP_CA_FL_SCALARD`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_CA_FL_SCALARD | PKID |  |  |  |
| FRS9_IMP_CA_FL_SCALARD | SCALAR_ID | Scalar ID | PKID Header |  |
| FRS9_IMP_CA_FL_SCALARD | PERIOD | Year | Data from upload |  |
| FRS9_IMP_CA_FL_SCALARD | WEIGHTED_SCALAR | Scalar Adjustment | Data from upload |  |
| FRS9_IMP_CA_FL_SCALARD | CREATEDBY |  |  |  |
| FRS9_IMP_CA_FL_SCALARD | CREATEDDATE |  |  |  |
| FRS9_IMP_CA_FL_SCALARD | CREATEDHOST |  |  |  |
| FRS9_IMP_CA_FL_SCALARD | UPDATEDBY |  |  |  |
| FRS9_IMP_CA_FL_SCALARD | UPDATEDDATE |  |  |  |
| FRS9_IMP_CA_FL_SCALARD | UPDATEDHOST |  |  |  |

### 11. LGD Setup Management

- Section: **Collective Impairment**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/LGDConfig`
- Source Reference: `_sources/ifrs9/Views/LGDConfig`
- Legacy Menu: Model Configuration=&gt;LGD Configuration / (https://psak413.ifrspro.id/config/model/lgd)
- Primary Table: `FRS9_IMP_CA_LGD_CONFIG`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_CA_LGD_CONFIG | PKID |  |  |  |
| FRS9_IMP_CA_LGD_CONFIG | LGD_MODEL_NAME * | Model Name | Text Box |  |
| FRS9_IMP_CA_LGD_CONFIG | SEGMENT_ID | Population Segment | Combo Box (ambil dari segmentation configuration header, segment type = 'LGD' ) |  |
| FRS9_IMP_CA_LGD_CONFIG | LGD_METHOD | Selected Method | Combo Box (Business Setting B0022) |  |
| FRS9_IMP_CA_LGD_CONFIG | POLUPATION_TYPE | Population Type | Combo Box (Business Setting B0023) |  |
| FRS9_IMP_CA_LGD_CONFIG | OBSERVATION_PERIOD | Historical Month | Number Text Box (enable jika LGD_METHOD = 1) |  |
| FRS9_IMP_CA_LGD_CONFIG | OBSERVATION_START_DATE | First NPL Date | Date Picker (enable jika LGD_METHOD = 1) |  |
| FRS9_IMP_CA_LGD_CONFIG | WORKOUT_PERIOD | Workout Period | Number Text Box (enable jika LGD_METHOD = 1) |  |
| FRS9_IMP_CA_LGD_CONFIG | FL_FLAG | FL Flag | Check box |  |
| FRS9_IMP_CA_LGD_CONFIG | FL_SCALAR_ID | FL Scalar | Combo Box (Ambil dari Master FL Scalar), Enable jika FL FLAG = 1 |  |
| FRS9_IMP_CA_LGD_CONFIG | LGD_RATE | LGD Rate | Number Text Box (Enable jika LGD_METHOD = 3) |  |
| FRS9_IMP_CA_LGD_CONFIG | ACTIVE_FLAG | Is Active | Check box |  |
| FRS9_IMP_CA_LGD_CONFIG | CREATEDBY |  |  |  |
| FRS9_IMP_CA_LGD_CONFIG | CREATEDDATE |  |  |  |
| FRS9_IMP_CA_LGD_CONFIG | CREATEDHOST |  |  |  |
| FRS9_IMP_CA_LGD_CONFIG | UPDATEDBY |  |  |  |
| FRS9_IMP_CA_LGD_CONFIG | UPDATEDDATE |  |  |  |
| FRS9_IMP_CA_LGD_CONFIG | UPDATEDHOST |  |  |  |

### 12. EAD Setup Management

- Section: **Collective Impairment**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/EADConfig`
- Source Reference: `_sources/ifrs9/Views/EADConfig`
- Legacy Menu: Model Configuration=&gt;EAD Configuration / (https://psak413.ifrspro.id/config/model/ead)
- Primary Table: `FRS9_IMP_CA_EAD_CONFIG`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_CA_EAD_CONFIG | PKID |  |  |  |
| FRS9_IMP_CA_EAD_CONFIG | EAD_MODEL_NAME * | Model Name |  |  |
| FRS9_IMP_CA_EAD_CONFIG | SEGMENT_ID | Population Segment | Combo Box (ambil dari segmentation configuration header, segment type = 'EAD' ) |  |
| FRS9_IMP_CA_EAD_CONFIG | EAD_METHOD | Selected Method | Combo Box (Business Setting B0020) |  |
| FRS9_IMP_CA_EAD_CONFIG | CALC_METHOD | Calculation Method | Combo Box (Business Setting B0021) |  |
| FRS9_IMP_CA_EAD_CONFIG | ACTIVE_FLAG | Is Active | Check box |  |
| FRS9_IMP_CA_EAD_CONFIG | CREATEDBY |  |  |  |
| FRS9_IMP_CA_EAD_CONFIG | CREATEDDATE |  |  |  |
| FRS9_IMP_CA_EAD_CONFIG | CREATEDHOST |  |  |  |
| FRS9_IMP_CA_EAD_CONFIG | UPDATEDBY |  |  |  |
| FRS9_IMP_CA_EAD_CONFIG | UPDATEDDATE |  |  |  |
| FRS9_IMP_CA_EAD_CONFIG | UPDATEDHOST |  |  |  |

### 13. ECL Configuration

- Section: **Collective Impairment**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/ECLConfig`
- Source Reference: `_sources/ifrs9/Views/ECLConfig`
- Legacy Menu: ECL Calculation=&gt;ECL Job Configuration / (https://psak413.ifrspro.id/ecl/configure)
- Primary Table: `FRS9_IMP_CA_ECL_CONFIGH`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_CA_ECL_CONFIGH | PKID |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGH | ECL_MODEL_NAME * | Model Name | Text Box |  |
| FRS9_IMP_CA_ECL_CONFIGH | MODULE | Module | Combo Box(Business Setting B0024) |  |
| FRS9_IMP_CA_ECL_CONFIGH | EFFECTIVE_DATE | Effective Date | Date Picker |  |
| FRS9_IMP_CA_ECL_CONFIGH | ACTIVE_FLAG | Is Active | Check box (validasi hanya ada satu status active per MODULE) |  |
| FRS9_IMP_CA_ECL_CONFIGH | LAST_RUN_PERIOD | Last Run Period | PRC DATE, update setelah proses jobs selesai |  |
| FRS9_IMP_CA_ECL_CONFIGH | LAST_RUN_STATUS | Last Run Status | ('Failed', 'Succeeded',..), update setelah proses jobs selesai |  |
| FRS9_IMP_CA_ECL_CONFIGH | LAST_RUN_DATE | Last Run Date | GETDATE(), update setelah proses jobs selesai |  |
| FRS9_IMP_CA_ECL_CONFIGH | CREATEDBY |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGH | CREATEDDATE |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGH | CREATEDHOST |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGH | UPDATEDBY |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGH | UPDATEDDATE |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGH | UPDATEDHOST |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGD | PKID |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGH | ECL_MODEL_ID |  | PKID Header |  |
| FRS9_IMP_CA_ECL_CONFIGH | PF_SEGMENT_ID | Portfolio Segment | Combo Box, ambil dari segment header dengan segment type = 'PF' |  |
| FRS9_IMP_CA_ECL_CONFIGH | STAGE_RULE_ID | Stage Rule | Combo Box, ambil dari rule based header dengan rule type = 'STAGE' |  |
| FRS9_IMP_CA_ECL_CONFIGH | PD_MODEL_ID | PD Model | Combo Box, ambil dari PD Config |  |
| FRS9_IMP_CA_ECL_CONFIGH | LGD_MODEL_ID | LGD Model | Combo Box, ambil dari LGD Config |  |
| FRS9_IMP_CA_ECL_CONFIGH | EAD_MODEL_ID | EAD Model | Combo Box, ambil dari EAD Config |  |
| FRS9_IMP_CA_ECL_CONFIGH | OVERLAY_RATE | Overlay Value (%) | Numbet Text Box default value 100 |  |
| FRS9_IMP_CA_ECL_CONFIGH | PERIOD_TYPE | Period Type | Combo Box (Business Setting B0025) |  |
| FRS9_IMP_CA_ECL_CONFIGH | PERIOD_DATE | Period Date | Date Picker (enable jika PERIOD TYPE = 5) |  |
| FRS9_IMP_CA_ECL_CONFIGH | CREATEDBY |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGH | CREATEDDATE |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGH | CREATEDHOST |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGH | UPDATEDBY |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGH | UPDATEDDATE |  |  |  |
| FRS9_IMP_CA_ECL_CONFIGH | UPDATEDHOST |  |  |  |

### 14. ECL Calculation-&gt;Run ECL Calculation

- Section: **Collective Impairment**
- Legacy Menu: ECL Calculation-&gt;Run ECL Calculation / (https://psak413.ifrspro.id/ecl/run)
- Primary Table: `Simulate (Service/Jobs)`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| Simulate (Service/Jobs) |  |  | SP_FRS9_PREVIEW_SEQUENCE |  |

### 15. ECL Calculation=&gt;View ECL Results

- Section: **Collective Impairment**
- Legacy Menu: ECL Calculation=&gt;View ECL Results  / (https://psak413.ifrspro.id/ecl/results)
- Primary Table: `Result`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| Result |  |  | Drill Down Header Detail  / Header : / SELECT * FROM FRS9_IMP_CA_RESULT_H_PRV WHERE ECL_MODEL_ID = @ECLMODELID  / Detail :  / SELECT * FROM FRS9_IMP_CA_RESULT_D_PRV WHERE ECL_MODEL_ID = @ECL_MODEL_ID AND ACCOUNT_ID = @ACCOUNTID | Tambahan kolom Account Number |

### 16. Individual Watchlist

- Section: **Individual Impairment**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/IndividualImpairment/AssesmentOverride`
- Source Reference: `_sources/ifrs9/Views/IndividualImpairment`
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_MASTER_ACCOUNT`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_MASTER_ACCOUNT | PRC_DATE | Download Date |  |  |
| FRS9_MASTER_ACCOUNT | CIF_NUMBER | Customer Number |  |  |
| FRS9_MASTER_ACCOUNT | CIF_NAME | Customer Name |  |  |
| FRS9_MASTER_ACCOUNT | ACCOUNT_NUMBER, | Account Number |  |  |
| FRS9_MASTER_ACCOUNT | CURRENCY, | Currency |  |  |
| FRS9_MASTER_ACCOUNT | OUTSTANDING, | Outstanding |  |  |
| FRS9_MASTER_ACCOUNT | DPD AS DAY_PAST_DUE, | Day Past Due |  |  |
| FRS9_MASTER_ACCOUNT | COLLECTABILITY, | Collectability |  |  |
| FRS9_MASTER_ACCOUNT | EXT_RATING_CODE | Rating |  |  |

### 17. List of Individual Report

- Section: **Individual Impairment**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_IMP_IA_HEADER`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_IA_HEADER | PRC_DATE | Download Date |  |  |
| FRS9_IMP_IA_HEADER | CIF_NUMBER | Customer Number |  |  |
| FRS9_IMP_IA_HEADER | CIF_NAME | Customer Name |  |  |
| FRS9_IMP_IA_HEADER | ACCOUNT_NUMBER | Account Number |  |  |
| FRS9_IMP_IA_HEADER | CURRENCY | Currency |  |  |
| FRS9_IMP_IA_HEADER | OUTSTANDING | Outstanding |  |  |
| FRS9_IMP_IA_HEADER | DPD | Day Past Due |  |  |
| FRS9_IMP_IA_HEADER | COLLECTABILITY | Collectability |  |  |
| FRS9_IMP_IA_HEADER | RATING_CODE | Rating |  |  |
| FRS9_IMP_IA_HEADER | EAD_AMT | EAD |  |  |
| FRS9_IMP_IA_HEADER | PV_DCF_AMT | PV Cashflow |  |  |
| FRS9_IMP_IA_HEADER | ECL_IA_AMT | IA Provision |  |  |
| FRS9_IMP_IA_HEADER | STATUS | Status | 1=New;2=Pending Approval;3=Approved |  |

### 18. Review -&gt; Impairment Override Trigger

- Section: **Individual Impairment**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_MASTER_ACCOUNT`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_MASTER_ACCOUNT | PRC_DATE | Download Date |  |  |
| FRS9_MASTER_ACCOUNT | CIF_NUMBER, | Customer Number |  |  |
| FRS9_MASTER_ACCOUNT | CIF_NAME, | Customer Name |  |  |
| FRS9_MASTER_ACCOUNT | ACCOUNT_NUMBER, | Account Number |  |  |
| FRS9_MASTER_ACCOUNT | CURRENCY, | Currency |  |  |
| FRS9_MASTER_ACCOUNT | OUTSTANDING, | Outstanding |  |  |
| FRS9_MASTER_ACCOUNT | DPD AS DAY_PAST_DUE, | Day Past Due |  |  |
| FRS9_MASTER_ACCOUNT | COLLECTABILITY, | Collectability |  |  |
| FRS9_MASTER_ACCOUNT | EXT_RATING_CODE AS RATING | Rating |  |  |
| FRS9_MASTER_ACCOUNT | Impaired Flag | Impaired Flag | Combo Box (I=Individual;C=Collective) |  |
| FRS9_MASTER_ACCOUNT | Early Warning Remarks | Early Warning Remarks | Free Text |  |
| FRS9_MASTER_ACCOUNT | Referrence | Referrence | Upload files |  |
| FRS9_MASTER_ACCOUNT | Submit | Submit | Submit |  |

### 19. Review -&gt; Scenario Details

- Section: **Individual Impairment**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_IMP_IA_HEADER`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_IA_HEADER | SCENARIO_ID,METHOD | DCF Scenario Rate | Combo Box (1=Possible Outcome and Repayment Rate;2=DCF;3=Collateral) |  |
| FRS9_IMP_IA_HEADER | N_OF_SCENARIO | Number of Scenario | Minimum 1, Max 3 | Validasi intereger Minimum 1, Max 3 |
| FRS9_IMP_IA_HEADER | PO_RATE_1 | Possible Outcome Rate (%) | Min 0 max 100 | Validasi total PO_RATE 1,2,3 =100 |
| FRS9_IMP_IA_HEADER | PO_RATE_2 |  | Min 0 max 100 |  |
| FRS9_IMP_IA_HEADER | PO_RATE_3 |  | Min 0 max 100 |  |
| FRS9_IMP_IA_HEADER | SC_NAME_1 | Scenario Name |  |  |
| FRS9_IMP_IA_HEADER | SC_NAME_2 |  |  |  |
| FRS9_IMP_IA_HEADER | SC_NAME_3 |  |  |  |
| FRS9_IMP_IA_RR | IA_ID, | IA_ID, | Hidden |  |
| FRS9_IMP_IA_HEADER | ACCOUNT_ID, | ACCOUNT_ID, | Hidden |  |
| FRS9_IMP_IA_HEADER | PERIOD_START, | Period Start | Add next Period Start otomatis digenerate dari prev Period End plus 1 bulan | Tambah add Button &amp; Validasi |
| FRS9_IMP_IA_HEADER | PERIOD_END, | Period End | Bulan Period End &gt; Bulan Period Start, Last Period End &gt;= Max Periode di DCF Upload |  |
| FRS9_IMP_IA_HEADER | RR_RATE_1, | Repayment Rate (%) | Min 0 max 100 |  |
| FRS9_IMP_IA_HEADER | RR_RATE_2, |  | Min 0 max 100 |  |
| FRS9_IMP_IA_HEADER | RR_RATE_3, |  | Min 0 max 100 |  |

### 20. Review -&gt; Upload DCF

- Section: **Individual Impairment**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_IMP_IA_DCF`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_IA_DCF | IA_ID | IA_ID | Hidden |  |
| FRS9_IMP_IA_DCF | PRC_DATE | PRC_DATE | Hidden |  |
| FRS9_IMP_IA_DCF | ACCOUNT_ID | ACCOUNT_ID | Hidden |  |
| FRS9_IMP_IA_DCF | ACCOUNT_NUMBER | Account Number | Account Number yg di upload harus sama dengan account yg di review | Validasi account number |
| FRS9_IMP_IA_DCF | MOB | MOB | Auto Increment start from 1 |  |
| FRS9_IMP_IA_DCF | PERIODE | Periode | Unique urut setiap bulan, tidak boleh ada &gt; 1 record tanggal dibulan yg sama |  |
| FRS9_IMP_IA_DCF | PRINCIPAL | Principal | &gt;= 0, tidak boleh Minus | Validasi Total Principal, Interest, Collateral yg diupload &lt;= Outstanding Master Account |
| FRS9_IMP_IA_DCF | INTEREST | Interest |  |  |
| FRS9_IMP_IA_DCF | COLLATERAL | Collateral |  |  |

### 21. Review -&gt; DCF Upload Report Detail

- Section: **Individual Impairment**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_IMP_IA_DCF`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_IA_DCF | ACCOUNT_NUMBER | Account Number |  |  |
| FRS9_IMP_IA_DCF | PERIODE | Periode |  |  |
| FRS9_IMP_IA_DCF | PRINCIPAL | Principal |  |  |
| FRS9_IMP_IA_DCF | INTEREST | Interest |  |  |
| FRS9_IMP_IA_DCF | COLLATERAL | Collateral |  |  |

### 22. Review -&gt; IA Discounted Cash Flow Detail

- Section: **Individual Impairment**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_IMP_IA_HEADER`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_IA_HEADER | EFF_DATE | Effective Date | EFF_DATE, |  |
| FRS9_IMP_IA_HEADER | ACCOUNT_NUMBER | Account Number | ACCOUNT_NUMBER, |  |
| FRS9_IMP_IA_HEADER | CIF_NUMBER | Customer Number | CIF_NUMBER, |  |
| FRS9_IMP_IA_HEADER | CIF_NAME | Customer Name | CIF_NAME, |  |
| FRS9_IMP_IA_HEADER | CURRENCY | Currency | CURRENCY, |  |
| FRS9_IMP_IA_HEADER | DPD | Day Past Due | DPD, |  |
| FRS9_IMP_IA_HEADER | COLLECTABILITY | Collectability | COLLECTABILITY, |  |
| FRS9_IMP_IA_HEADER | RATING_CODE | Rating | RATING_CODE, |  |
| FRS9_IMP_IA_HEADER | INTEREST_RATE | Interest Rate | INTEREST_RATE, |  |
| FRS9_IMP_IA_HEADER | EFF_INTEREST_RATE | Effective Interest Rate | EFF_INTEREST_RATE, |  |
| FRS9_IMP_IA_HEADER | OUTSTANDING | Outstanding | OUTSTANDING, |  |
| FRS9_IMP_IA_HEADER | ACCRUED_INTEREST | Accrued Interest | ACCRUED_INTEREST, |  |
| FRS9_IMP_IA_HEADER | CARRYING_AMT | Carrying Amount | CARRYING_AMT, |  |
| FRS9_IMP_IA_HEADER | EAD_AMT | EAD | EAD_AMT, |  |
| FRS9_IMP_IA_HEADER | PV_DCF_AMT | PV Cashflow | PV_DCF_AMT, |  |
| FRS9_IMP_IA_HEADER | ECL_IA_AMT | IA Provision | ECL_IA_AMT, |  |
| FRS9_IMP_IA_DETAIL | MOB | No. | MOB, |  |
| FRS9_IMP_IA_HEADER | PERIODE | Estimated Date | PERIODE, |  |
| FRS9_IMP_IA_HEADER | PRINCIPAL | Principal | PRINCIPAL, |  |
| FRS9_IMP_IA_HEADER | INTEREST | Interest | INTEREST, |  |
| FRS9_IMP_IA_HEADER | INSTALLMENT | Installment | INSTALLMENT, |  |
| FRS9_IMP_IA_HEADER | COLLATERAL | Collateral | COLLATERAL, |  |
| FRS9_IMP_IA_HEADER | PO_RATE_1 | Pos Rate 1 | PO_RATE_1, |  |
| FRS9_IMP_IA_HEADER | RR_RATE_1 | Repayment Rate 1 | RR_RATE_1, |  |
| FRS9_IMP_IA_HEADER | DEFAULT_1 | Default 1 | DEFAULT_1, |  |
| FRS9_IMP_IA_HEADER | PO_RATE_2 | Pos Rate 2 | PO_RATE_2, |  |
| FRS9_IMP_IA_HEADER | RR_RATE_2 | Repayment Rate 2 | RR_RATE_2, |  |
| FRS9_IMP_IA_HEADER | DEFAULT_2 | Default 2 | DEFAULT_2, |  |
| FRS9_IMP_IA_HEADER | PO_RATE_3 | Pos Rate 3 | PO_RATE_3, |  |
| FRS9_IMP_IA_HEADER | RR_RATE_3 | Repayment Rate 3 | RR_RATE_3, |  |
| FRS9_IMP_IA_HEADER | DEFAULT_3 | Default 3 | DEFAULT_3, |  |
| FRS9_IMP_IA_HEADER | PW_AMT | Probability Weighted | PW_AMT, |  |
| FRS9_IMP_IA_HEADER | DISCOUNT_FACTOR | Discount Factor | DISCOUNT_FACTOR, |  |
| FRS9_IMP_IA_HEADER | PV_AMT | PV Cashflow | PV_AMT, |  |
| FRS9_IMP_IA_HEADER | BEGINNING_BALANCE | Beginning Balance | BEGINNING_BALANCE, |  |
| FRS9_IMP_IA_HEADER | EIR_AMT | Unwinding | EIR_AMT, |  |
| FRS9_IMP_IA_HEADER | ENDING_BALANCE | Ending Balance | ENDING_BALANCE, |  |

### 23. History -&gt; Customer Details

- Section: **Individual Impairment**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `Tabel disesuaikan dengan tabel master`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| Tabel disesuaikan dengan tabel master | Fields &amp; Column Header disesuaikan dengan tabel master |  | Logic sama dengan history upload files, di tabel master hanya ada posisi data terakhir review, untuk data history review ambil dari tabel2 history baik yg approved maupun reject |  |

### 24. DCF

- Section: **History -&gt; Collateral**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_IMP_IA_DCF`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_IA_DCF | ACCOUNT_NUMBER | Account Number |  |  |
| FRS9_IMP_IA_DCF | PERIODE | Periode |  |  |
| FRS9_IMP_IA_DCF | PRINCIPAL | Principal |  |  |
| FRS9_IMP_IA_DCF | INTEREST | Interest |  |  |
| FRS9_IMP_IA_DCF | COLLATERAL | Collateral |  |  |

### 25. Jobs Activity Monitor

- Section: **Maintenance**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/JobMonitoring`
- Source Reference: `_sources/ifrs9/Views/JobMonitoring`
- Legacy Menu: New Menu (belum ada di new platform)

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 26. Impairment Module

- Section: **IFRS 9**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/ifrs`
- Source Reference: `_sources/ifrs9/Views/IFRS`
- Legacy Menu: New Menu (belum ada di new platform)
- New Platform Menu: ImpairmentModels
- Primary Table: `FRS9_MASTER_ACCOUNT`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_MASTER_ACCOUNT |  |  | SELECT  / PRC_DATE,  / ACCOUNT_NUMBER, / FACILITY_NUMBER, / CIF_NUMBER, / CIF_NAME, / ACCOUNT_STATUS, / DATA_SOURCE, / PRD_GROUP, / PRD_TYPE, / PRD_CODE, / BRANCH_CODE, / TENOR_ORG, / START_DATE, / MATURITY_DATE, / PAID_OFF_DATE, / WRITE_OFF_DATE, / FIRST_PAYMENT_DATE, / NEXT_PAYMENT_DATE, / LAST_PAYMENT_DATE, / GRACE_TYPE, / GRACE_START_DATE, / GRACE_END_DATE, / INTEREST_RATE, / EFF_INTEREST_RATE, / COLLECTABILITY, / DPD, / EXT_RATING_CODE_INITIAL, / EXT_RATING_AGENCY_INITIAL, / EXT_RATING_CODE, / EXT_RATING_AGENCY, / PAYMENT_CODE, / PAYMENT_TERM, / PAYMENT_FREQ, / INT_PMT_TERM, / INT_PMT_FREQ, / NPL_FLAG, / NPL_DATE, / RESTRUCTURE_FLAG, / RESTRUCTURE_DATE, / RESTRUCTURE_REVIEW_DATE, / INTEREST_BASE, / ASSET_CLASS, / CURRENCY, / EXCHANGE_RATE, / PLAFOND, / UNUSED_AMT, / OUTSTANDING, / OUTSTANDING_WO, / ACCRUED_INTEREST, / INSTALLMENT_AMT, / FIX_PRINCIPAL_AMT, / FIX_INTEREST_AMT, / IMPAIRED_FLAG, / IMPAIRED_STATUS, / GROUP_SEGMENT, / SEGMENT, / SUB_SEGMENT, / BUCKET_ID, / SICR_FLAG, / STAGE, / ECL_CA_ONBS_AMT, / ECL_CA_OFFBS_AMT, / ECL_IA_ONBS_AMT, / ECL_OVERLAY_AMT, / ECL_FINAL_AMT, / CASE WHEN OUTSTANDING = 0 THEN 0 ELSE ECL_FINAL_AMT/OUTSTANDING END AS ECL_COVERAGE, / UNWINDING_CA_AMT, / UNWINDING_IA_AMT, / UNWINDING_IA_SUM_AMT / FROM FRS9_MASTER_ACCOUNT  / WHERE PRC_DATE = '20200630' | Caption halaman utama masih Lease Contract |

### 27. Contract Details

- Section: **IFRS 9**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/LeaseContract`
- Source Reference: `_sources/ifrs9/Views/LeaseContract`
- Legacy Menu: New Menu (belum ada di new platform)
- New Platform Menu: AmortizationModule
- Primary Table: `FRS9_MASTER_ACCOUNT`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_MASTER_ACCOUNT |  |  | SELECT  / PRC_DATE, / ACCOUNT_NUMBER, / FACILITY_NUMBER, / CIF_NUMBER, / CIF_NAME, / ACCOUNT_STATUS, / DATA_SOURCE, / PRD_GROUP, / PRD_TYPE, / PRD_CODE, / BRANCH_CODE, / TENOR_ORG, / START_DATE, / MATURITY_DATE, / PAID_OFF_DATE, / WRITE_OFF_DATE, / FIRST_PAYMENT_DATE, / NEXT_PAYMENT_DATE, / LAST_PAYMENT_DATE, / GRACE_TYPE, / GRACE_START_DATE, / GRACE_END_DATE, / INTEREST_RATE, / EFF_INTEREST_RATE, / COLLECTABILITY, / DPD, / EXT_RATING_CODE_INITIAL, / EXT_RATING_AGENCY_INITIAL, / EXT_RATING_CODE, / EXT_RATING_AGENCY, / PAYMENT_CODE, / PAYMENT_TERM, / PAYMENT_FREQ, / INT_PMT_TERM, / INT_PMT_FREQ, / NPL_FLAG, / NPL_DATE, / RESTRUCTURE_FLAG, / RESTRUCTURE_DATE, / RESTRUCTURE_REVIEW_DATE, / INTEREST_BASE, / ASSET_CLASS, / CURRENCY, / EXCHANGE_RATE, / PLAFOND, / UNUSED_AMT, / OUTSTANDING, / OUTSTANDING_WO, / ACCRUED_INTEREST, / INSTALLMENT_AMT, / FIX_PRINCIPAL_AMT, / FIX_INTEREST_AMT, / IMPAIRED_FLAG, / IMPAIRED_STATUS, / GROUP_SEGMENT, / SEGMENT, / SUB_SEGMENT, / BUCKET_ID, / SICR_FLAG, / STAGE, / ECL_CA_ONBS_AMT, / ECL_CA_OFFBS_AMT, / ECL_IA_ONBS_AMT, / ECL_OVERLAY_AMT, / ECL_FINAL_AMT, / CASE WHEN OUTSTANDING = 0 THEN 0 ELSE ECL_FINAL_AMT/OUTSTANDING END AS ECL_COVERAGE, / UNWINDING_CA_AMT, / UNWINDING_IA_AMT, / UNWINDING_IA_SUM_AMT / FROM FRS9_MASTER_ACCOUNT  / WHERE PRC_DATE = '20200630' |  |

### 28. Collective Impairment Details

- Section: **IFRS 9**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_IMP_CA_RESULT_D`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_CA_RESULT_D |  |  | SELECT  / A.PRC_DATE, / A.ACCOUNT_ID, / B.ACCOUNT_NUMBER, / A.FACILITY_NUMBER, / A.CIF_NUMBER, / A.SEGMENT_ID, / A.REMAINING_TENOR, / A.START_DATE, / A.MATURITY_DATE, / A.DEFAULT_FLAG, / A.DPD, / A.INTERNAL_RATING_CODE, / A.EXT_RATING_CODE, / A.EXT_RATING_ID, / A.ECL_MODEL_ID, / A.PD_CONFIG_ID, / A.LGD_CONFIG_ID, / A.EAD_CONFIG_ID, / A.EAD_METHOD, / A.BUCKET_GROUP, / A.BUCKET_ID, / A.CURRENCY, / A.STAGE, / A.SCENARIO_NO, / A.FL_SEQ, / A.FL_YEAR, / A.FL_MOTNH, / A.EIR, / A.EXCHANGE_RATE, / A.OUTSTANDING, / A.PLAFOND, / A.FIB_AMT, / A.ACCRUED_INTEREST, / A.UNAMORT_COST_AMT, / A.UNAMORT_FEE_AMT, / A.EAD_BALANCE, / A.PAYM_AVG, / A.PRINCIPAL_AMT, / A.SUM_PRINCIPAL_AMT, / A.NEXT_INTEREST, / A.SUM_NEXT_INTEREST, / A.EAD, / A.PD, / A.LGD, / A.ECL_AMOUNT, / A.PROBABILITY, / A.ECL_WEIGHTED / FROM FRS9_IMP_CA_RESULT_D A  / INNER JOIN FRS9_ACCOUNT_ID B / ON A.ACCOUNT_ID = B.ACCOUNT_ID / WHERE A.PRC_DATE = '20200630'  / AND A.ACCOUNT_ID = 1 / ORDER BY A.FL_SEQ | - Result tidak tampil di grid  / - Add column account_number |

### 29. Individual Impairment Details

- Section: **IFRS 9**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_IMP_IA_RESULT_H`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_IA_RESULT_H | EFF_DATE | Effective Date | EFF_DATE, |  |
| FRS9_IMP_IA_RESULT_H | ACCOUNT_NUMBER | Account Number | ACCOUNT_NUMBER, |  |
| FRS9_IMP_IA_RESULT_H | CIF_NUMBER | Customer Number | CIF_NUMBER, |  |
| FRS9_IMP_IA_RESULT_H | CIF_NAME | Customer Name | CIF_NAME, |  |
| FRS9_IMP_IA_RESULT_H | CURRENCY | Currency | CURRENCY, |  |
| FRS9_IMP_IA_RESULT_H | DPD | Day Past Due | DPD, |  |
| FRS9_IMP_IA_RESULT_H | COLLECTABILITY | Collectability | COLLECTABILITY, |  |
| FRS9_IMP_IA_RESULT_H | RATING_CODE | Rating | RATING_CODE, |  |
| FRS9_IMP_IA_RESULT_H | INTEREST_RATE | Interest Rate | INTEREST_RATE, |  |
| FRS9_IMP_IA_RESULT_H | EFF_INTEREST_RATE | Effective Interest Rate | EFF_INTEREST_RATE, |  |
| FRS9_IMP_IA_RESULT_H | OUTSTANDING | Outstanding | OUTSTANDING, |  |
| FRS9_IMP_IA_RESULT_H | ACCRUED_INTEREST | Accrued Interest | ACCRUED_INTEREST, |  |
| FRS9_IMP_IA_RESULT_H | CARRYING_AMT | Carrying Amount | CARRYING_AMT, |  |
| FRS9_IMP_IA_RESULT_H | EAD_AMT | EAD | EAD_AMT, |  |
| FRS9_IMP_IA_RESULT_H | PV_DCF_AMT | PV Cashflow | PV_DCF_AMT, |  |
| FRS9_IMP_IA_RESULT_H | ECL_IA_AMT | IA Provision | ECL_IA_AMT, |  |
| FRS9_IMP_IA_RESULT_D | MOB | No. | MOB, |  |
| FRS9_IMP_IA_RESULT_H | PERIODE | Estimated Date | PERIODE, |  |
| FRS9_IMP_IA_RESULT_H | PRINCIPAL | Principal | PRINCIPAL, |  |
| FRS9_IMP_IA_RESULT_H | INTEREST | Interest | INTEREST, |  |
| FRS9_IMP_IA_RESULT_H | INSTALLMENT | Installment | INSTALLMENT, |  |
| FRS9_IMP_IA_RESULT_H | COLLATERAL | Collateral | COLLATERAL, |  |
| FRS9_IMP_IA_RESULT_H | PO_RATE_1 | Pos Rate 1 | PO_RATE_1, |  |
| FRS9_IMP_IA_RESULT_H | RR_RATE_1 | Repayment Rate 1 | RR_RATE_1, |  |
| FRS9_IMP_IA_RESULT_H | DEFAULT_1 | Default 1 | DEFAULT_1, |  |
| FRS9_IMP_IA_RESULT_H | PO_RATE_2 | Pos Rate 2 | PO_RATE_2, |  |
| FRS9_IMP_IA_RESULT_H | RR_RATE_2 | Repayment Rate 2 | RR_RATE_2, |  |
| FRS9_IMP_IA_RESULT_H | DEFAULT_2 | Default 2 | DEFAULT_2, |  |
| FRS9_IMP_IA_RESULT_H | PO_RATE_3 | Pos Rate 3 | PO_RATE_3, |  |
| FRS9_IMP_IA_RESULT_H | RR_RATE_3 | Repayment Rate 3 | RR_RATE_3, |  |
| FRS9_IMP_IA_RESULT_H | DEFAULT_3 | Default 3 | DEFAULT_3, |  |
| FRS9_IMP_IA_RESULT_H | PW_AMT | Probability Weighted | PW_AMT, |  |
| FRS9_IMP_IA_RESULT_H | DISCOUNT_FACTOR | Discount Factor | DISCOUNT_FACTOR, |  |
| FRS9_IMP_IA_RESULT_H | PV_AMT | PV Cashflow | PV_AMT, |  |
| FRS9_IMP_IA_RESULT_H | BEGINNING_BALANCE | Beginning Balance | BEGINNING_BALANCE, |  |
| FRS9_IMP_IA_RESULT_H | EIR_AMT | Unwinding | EIR_AMT, |  |
| FRS9_IMP_IA_RESULT_H | ENDING_BALANCE | Ending Balance | ENDING_BALANCE, |  |

### 30. Journal Details

- Section: **IFRS 9**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_IMP_JOURNAL_DATA`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_JOURNAL_DATA |  |  | SELECT  / A.PRC_DATE as [Download_Date], / A.ACCOUNT_ID as [Account ID], / B.ACCOUNT_NUMBER AS [Account Number], / A.BRANCH as [Branch Code], / A.CURRENCY as [Currency], / A.JOURNALCODE AS [Journal Type],  / A.GL_DESC as [Journal Description],  / A.GL_NUMBER AS [GL Account],  / A.DBCR as [Db/Cr],  / A.N_AMOUNT as [Original Amount],  / A.N_AMOUNT_IDR as [Eqv IDR Amount]   / FROM FRS9_IMP_JOURNAL_DATA A  / INNER JOIN FRS9_ACCOUNT_ID B  / ON A.ACCOUNT_ID = B.ACCOUNT_ID / WHERE A.ACCOUNT_ID = '1'  / ORDER BY A.PRC_DATE,A.BRANCH,CURRENCY,A.JOURNALCODE,A.GL_NUMBER,A.DBCR | Add kolom account number |

### 31. Amortization Module

- Section: **IFRS 9**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_MASTER_ACCOUNT`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 32. Contract Details

- Section: **IFRS 9**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_MASTER_ACCOUNT`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 33. Fee/Cost

- Section: **IFRS 9**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_MASTER_TRANSACTION_COST`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_MASTER_TRANSACTION_COST |  |  | Display Grid Fee |  |

### 34. New Menu (belum ada di new platform)

- Section: **IFRS 9**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_MASTER_TRANSACTION_COST`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_MASTER_TRANSACTION_COST |  |  | Display Grid Cost |  |

### 35. Amortization &amp; Event

- Section: **IFRS 9**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_EVENT_CHANGES`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_EVENT_CHANGES |  |  | Display Grid Event |  |
| FRS9_EIR_ECF |  |  | Show Grid Event |  |

### 36. Journal Details

- Section: **IFRS 9**
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_AMORT_JOURNAL_DATA`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 37. Manual Upload

- Section: **IFRS 9**
- Legacy Menu: Data Management=&gt;Manual Upload  / (https://psak413.ifrspro.id/data/upload)

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 38. Master Account

- Section: **IFRS 9**
- Primary Table: `TBLU_MASTER_ACCOUNT`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 39. Master Payment Schedule

- Section: **IFRS 9**
- Primary Table: `TBLU_MASTER_PAYMENT_SCHEDULE`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 40. Master Collateral

- Section: **IFRS 9**
- Legacy Menu: Data Management=&gt;Upload History  / (https://psak413.ifrspro.id/data/history)
- Primary Table: `TBLU_MASTER_COLLATERAL`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 41. Master PD Proxy

- Section: **IFRS 9**
- Primary Table: `TBLU_MASTER_PD_PROXY`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 42. Nominatif Report

- Section: **Reporting**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/NominativeReport`
- Source Reference: `_sources/ifrs9/Views/NominativeReport`
- Legacy Menu: Reporting=&gt;Nominative Report  / (https://psak413.ifrspro.id/reporting/nominative)

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 43. Lifetime PD

- Section: **Reporting**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/LifetimePD`
- Source Reference: `_sources/ifrs9/Views/LifetimePD`
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_IMP_CA_PD_STRUCTURE`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_CA_PD_STRUCTURE |  |  | DECLARE @DATE DATE ='20201231' / DECLARE @STR_DATE AS VARCHAR(10) / DECLARE @PD_CONFIG_ID INT / DECLARE @PD_METHOD INT / DECLARE @SCALAR_ID INT / DECLARE @PVT_COLUMN_YEARLY AS VARCHAR(MAX) / DECLARE @PVT_COLUMN_MONTHLY AS VARCHAR(MAX) / DECLARE @SQL_PD_YEARLY AS VARCHAR(MAX) / DECLARE @SQL_PD_MONTHLY AS VARCHAR(MAX)  / DECLARE @FL_FLAG AS BIT /  / SET @STR_DATE = CAST(@DATE AS varchar) / SET @PD_CONFIG_ID = 1 / SET @PD_METHOD = 1 / SET @SCALAR_ID = 0 / SET @FL_FLAG = 0 /  / --DROP TABLE IF EXISTS #PD_YEARLY / IF OBJECT_ID('tempdb..#PD_YEARLY') IS NOT NULL         / DROP TABLE #PD_YEARLY /  / SELECT BUCKET_ID AS [BUCKET/YEAR],FL_YEAR,CASE WHEN @FL_FLAG = 1 THEN PD ELSE PD_NON_FL END AS PD_RATE  / INTO #PD_YEARLY  / FROM FRS9_IMP_CA_PD_STRUCTURE  / WHERE PRC_DATE = @DATE AND PD_CONFIG_ID = @PD_CONFIG_ID AND PD_METHOD = @PD_METHOD --AND SCALAR_ID = @SCALAR_ID /  / SELECT @PVT_COLUMN_YEARLY = ISNULL(@PVT_COLUMN_YEARLY + ',','') + QUOTENAME(FL_YEAR) / FROM ( / SELECT DISTINCT(FL_YEAR) AS FL_YEAR FROM #PD_YEARLY / ) AS X / ORDER BY X.FL_YEAR /  / --PRINT @PVT_COLUMN_YEARLY /  / SET @SQL_PD_YEARLY = 'SELECT * FROM ( / SELECT * FROM #PD_YEARLY / ) AS PD_YEARLY / PIVOT (SUM(PD_RATE) FOR FL_YEAR IN (' + @PVT_COLUMN_YEARLY + ')) AS PVT_PD_YEARLY / ORDER BY [BUCKET/YEAR]' /  / EXEC (@SQL_PD_YEARLY)  /  / --DROP TABLE IF EXISTS #PD_MONTHLY / IF OBJECT_ID('tempdb..#PD_MONTHLY') IS NOT NULL         / DROP TABLE #PD_MONTHLY /  / SELECT BUCKET_ID AS [BUCKET/MONTH],FL_SEQ,CASE WHEN @FL_FLAG = 1 THEN PD ELSE PD_NON_FL END AS PD_RATE  / INTO #PD_MONTHLY  / FROM FRS9_IMP_CA_PD_STRUCTURE  / WHERE PRC_DATE = @DATE AND PD_CONFIG_ID = @PD_CONFIG_ID AND PD_METHOD = @PD_METHOD --AND SCALAR_ID = @SCALAR_ID /  / SELECT @PVT_COLUMN_MONTHLY = ISNULL(@PVT_COLUMN_MONTHLY + ',','') + QUOTENAME(FL_SEQ) / FROM ( / SELECT DISTINCT(FL_SEQ) AS FL_SEQ FROM #PD_MONTHLY / ) AS X / ORDER BY X.FL_SEQ /  / --PRINT @PVT_COLUMN_MONTHLY /  / SET @SQL_PD_MONTHLY = 'SELECT * FROM ( / SELECT * FROM #PD_MONTHLY / ) AS PD_MONTHLY / PIVOT (SUM(PD_RATE) FOR FL_SEQ IN (' + @PVT_COLUMN_MONTHLY + ')) AS PVT_PD_MONTHLY / ORDER BY [BUCKET/MONTH]' /  / EXEC (@SQL_PD_MONTHLY) | -Grafik monthly marginal curve belum ada  / -Grid FL Scalar belum ada, query FL Scalar :  / SELECT FL_YEAR,CASE WHEN @FL_FLAG = 1 THEN SUM(WEIGHTED_SCALAR) ELSE 1 END AS PD_SCALAR  / FROM FRS9_IMP_CA_PD_STRUCTURE  / WHERE PRC_DATE = @DATE AND PD_CONFIG_ID = @PD_CONFIG_ID AND PD_METHOD = @PD_METHOD  / GROUP BY FL_YEAR |

### 44. Lifetime LGD

- Section: **Reporting**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/LifetimeLGD`
- Source Reference: `_sources/ifrs9/Views/LifetimeLGD`
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_MASTER_ACCOUNT / FRS9_IMP_CA_LGD_DATA / FRS9_IMP_CA_LGD_REC_D / FRS9_IMP_CA_LGD_H / FRS9_IMP_CA_LGD_CONFIG`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_MASTER_ACCOUNT / FRS9_IMP_CA_LGD_DATA / FRS9_IMP_CA_LGD_REC_D / FRS9_IMP_CA_LGD_H / FRS9_IMP_CA_LGD_CONFIG |  |  | DECLARE @DATE DATE ='20200630' / DECLARE @STR_DATE AS VARCHAR(10) / DECLARE @LGD_CONFIG_ID INT / DECLARE @LGD_METHOD INT / DECLARE @MODEL_ID INT / DECLARE @PVT_COLUMN_LGD AS VARCHAR(MAX) / DECLARE @SQL_LGD AS VARCHAR(MAX) /  / SET @STR_DATE = CAST(@DATE AS varchar) / SET @LGD_CONFIG_ID = 2 / SET @LGD_METHOD = 1 / SET @MODEL_ID = 0 /  / --DROP TABLE IF EXISTS #LGD / IF OBJECT_ID('tempdb..#LGD') IS NOT NULL         / DROP TABLE #LGD /  / SELECT A.ACCOUNT_NUMBER,A.CIF_NAME,B.PRC_DATE AS FIRST_NPL_DATE,B.EQV_AT_DEFAULT AS OS_AT_DEFAULT,C.SEQ,C.NPV_EQV_REC AS PV_RECOVERY / INTO #LGD / FROM FRS9_ACCOUNT_ID A / INNER JOIN FRS9_IMP_CA_LGD_DATA B  / ON A.ACCOUNT_ID = B.ACCOUNT_ID / INNER JOIN FRS9_IMP_CA_LGD_REC_D C / ON B.ACCOUNT_ID = C.ACCOUNT_ID  / WHERE B.PRC_DATE &lt;= @DATE / AND B.LGD_CONFIG_ID = @LGD_CONFIG_ID /  / SELECT @PVT_COLUMN_LGD = ISNULL(@PVT_COLUMN_LGD + ',','') + QUOTENAME(SEQ) / FROM ( / SELECT DISTINCT(SEQ) AS SEQ FROM #LGD / ) AS X / ORDER BY X.SEQ /  / PRINT @PVT_COLUMN_LGD /  / SET @SQL_LGD = 'SELECT * FROM ( / SELECT * FROM #LGD / ) AS LGD / PIVOT (SUM(PV_RECOVERY) FOR SEQ IN (' + @PVT_COLUMN_LGD + ')) AS PVT_LGD / ORDER BY ACCOUNT_NUMBER' /  / EXEC (@SQL_LGD)  /  / SELECT PRC_DATE AS [PERIOD], / B.LGD_MODEL_NAME AS LGD_MODEL, / EQV_OS AS TOTAL_EAD, / NPV_EQV_REC AS TOTAL_PV_RECOVERY, / REC_RATE, / LGD AS LGD_RATE  / FROM FRS9_IMP_CA_LGD_H A / INNER JOIN FRS9_IMP_CA_LGD_CONFIG B / ON A.LGD_CONFIG_ID = B.PKID / WHERE PRC_DATE = @DATE / AND LGD_CONFIG_ID = @LGD_CONFIG_ID | - Data tidak muncul  / - Perubahan Query |

### 45. EAD Model

- Section: **Reporting**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/EADModel`
- Source Reference: `_sources/ifrs9/Views/EADModel`
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_IMP_CA_EAD_PAYM_AVG`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_CA_EAD_PAYM_AVG |  |  | DECLARE @DATE DATE ='20201231' / DECLARE @STR_DATE AS VARCHAR(10) / DECLARE @EAD_CONFIG_ID INT / DECLARE @PVT_COLUMN_EAD AS VARCHAR(MAX) / DECLARE @SQL_EAD AS VARCHAR(MAX) /  / SET @STR_DATE = CAST(@DATE AS varchar) / SET @EAD_CONFIG_ID = 1 /  /  / DROP TABLE IF EXISTS #EAD /  / SELECT A.TENOR AS [LT/MONTH],COUNTER AS SEQ,PAYM_AVG / INTO #EAD / FROM FRS9_IMP_CA_EAD_PAYM_AVG A  / WHERE A.PRC_DATE = @DATE  / AND A.SEGMENT_ID = @EAD_CONFIG_ID /  / SELECT @PVT_COLUMN_EAD = ISNULL(@PVT_COLUMN_EAD + ',','') + QUOTENAME(SEQ) / FROM ( / SELECT DISTINCT(SEQ) AS SEQ FROM #EAD / ) AS X / ORDER BY X.SEQ /  / PRINT @PVT_COLUMN_EAD /  / SET @SQL_EAD = 'SELECT * FROM ( / SELECT * FROM #EAD / ) AS LGD / PIVOT (SUM(PAYM_AVG) FOR SEQ IN (' + @PVT_COLUMN_EAD + ')) AS PVT_EAD / ORDER BY [LT/MONTH]' /  / EXEC (@SQL_EAD) |  |

### 46. ECL Result

- Section: **Reporting**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/ECLResult`
- Source Reference: `_sources/ifrs9/Views/ECLResult`
- Legacy Menu: New Menu (belum ada di new platform)
- Primary Table: `FRS9_MASTER_ACCOUNT`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_MASTER_ACCOUNT |  |  | SELECT PRC_DATE AS [Period],  / BRANCH_CODE, / SEGMENT_ID, / GROUP_SEGMENT, / SEGMENT, / SUB_SEGMENT, / CURRENCY, / IMPAIRED_FLAG, / IMPAIRED_STATUS, / BUCKET_ID, / SICR_FLAG, / STAGE, / SUM(OUTSTANDING) AS [Outstanding], / SUM(ACCRUED_INTEREST) AS [Accrued Interest], / SUM(ECL_CA_ONBS_AMT) AS [ECL CA On BS], / SUM(ECL_CA_OFFBS_AMT) AS [ECL CA Off BS], / SUM(ECL_IA_ONBS_AMT) AS [ECL IA], / SUM(ECL_OVERLAY_AMT) AS [ECL Overlay], / SUM(ECL_FINAL_AMT) AS [ECL Final], / SUM(CASE WHEN OUTSTANDING = 0 THEN 0 ELSE ECL_FINAL_AMT/OUTSTANDING END) AS [ECL Coverage], / SUM(UNWINDING_CA_AMT) AS [Unwinding CA], / SUM(UNWINDING_IA_AMT) AS [Unwinding IA], / SUM(UNWINDING_IA_SUM_AMT) AS [Total Unwinding IA] / FROM FRS9_MASTER_ACCOUNT / WHERE PRC_DATE = '20200630' / AND SEGMENT_ID = 2 / --AND SUB_SEGMENT = 'FL'  / AND STAGE = 1  / GROUP BY  / PRC_DATE,  / BRANCH_CODE, / SEGMENT_ID, / GROUP_SEGMENT, / SEGMENT, / SUB_SEGMENT, / CURRENCY, / IMPAIRED_FLAG, / IMPAIRED_STATUS, / BUCKET_ID, / SICR_FLAG, / STAGE | - Data tidak muncul  / - Combo box Segment distinct dari (PKID,Sub Segment) menu segmentation configuration yg segment type = Portfolio Segment, ada pilihan All  / - Combo box Stage ambil dari business setting (B0026), ada pilihan All |

### 47. Curtom Report 1 (ECLMovement)

- Section: **Custom Reports**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/ECLMovement`
- Source Reference: `_sources/ifrs9/Views/ECLMovement`
- Legacy Menu: Reporting=&gt;GCA Movement Report  / (https://psak413.ifrspro.id/reporting/gca-movement)
- Primary Table: `FRS9_IMP_MOVEMENT_DATA`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|
| FRS9_IMP_MOVEMENT_DATA |  |  | SP : USPR_FRS9_IMP_MOVEMENT | - Data tidak muncul  / - Combo box Group Segment distinct dari (PKID,Sub Segment) menu segmentation configuration yg segment type = Portfolio Segment, ada pilihan All |

### 48. Curtom Report 2(GCAMovement)

- Section: **Custom Reports**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/GCAMovement`
- Source Reference: `_sources/ifrs9/Views/GCAMovement`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 49. Approval

- Section: **Maintenance**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/Approval`
- Source Reference: `_sources/ifrs9/Views/Approval`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 50. UserActivity

- Section: **Maintenance**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/UserActivity`
- Source Reference: `_sources/ifrs9/Views/UserActivity`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 51. JobMonitoring

- Section: **Maintenance**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/JobMonitoring`
- Source Reference: `_sources/ifrs9/Views/JobMonitoring`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 52. UserManagement

- Section: **Maintenance**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/UserManagement`
- Source Reference: `_sources/ifrs9/Views/UserManagement`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 53. RoleManagement

- Section: **Maintenance**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/RoleManagement`
- Source Reference: `_sources/ifrs9/Views/RoleManagement`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

### 54. ManualUpload

- Section: **Tools**
- Legacy URL: `https://frs9.ifrspro.id/IFRS9N/ManualUpload`
- Source Reference: `_sources/ifrs9/Views/ManualUpload`

| Table | Field | UI Header | Remarks | Note |
|---|---|---|---|---|

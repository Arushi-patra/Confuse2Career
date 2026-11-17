# Final Model Report

## Dataset

The final workbook contains 1,500 student records in `Master_Students` and 500 records in each resource/opportunity sheet.

## Target

`Overall_Status` is modeled as historical preparation status, not placement outcome.

## Leakage prevention

Identifiers are excluded. Resume/status fields are conservatively excluded from the readiness classifier because of very strong association with the target and possible target-construction leakage.

## Model comparison

| model                |   accuracy |   macro_precision |   macro_recall |   macro_f1 |   weighted_f1 | error                                                                                                         |
|:---------------------|-----------:|------------------:|---------------:|-----------:|--------------:|:--------------------------------------------------------------------------------------------------------------|
| Dummy                |   0.4275   |          0.106875 |       0.25     |   0.149737 |      0.256054 | nan                                                                                                           |
| LogisticRegression   |   0.955833 |          0.948329 |       0.948545 |   0.94746  |      0.95588  | nan                                                                                                           |
| RandomForest         |   0.94     |          0.924276 |       0.938194 |   0.930252 |      0.940374 | nan                                                                                                           |
| ExtraTrees           |   0.946667 |          0.934122 |       0.945105 |   0.938612 |      0.946931 | nan                                                                                                           |
| HistGradientBoosting | nan        |        nan        |     nan        | nan        |    nan        | Sparse data was passed for X, but dense data is required. Use '.toarray()' to convert to a dense numpy array. |

## Selected model

**LogisticRegression** selected by cross-validated Macro F1.

## Recommendation system

Resource catalog contains 1500 rows across courses, YouTube videos, and projects. URLs are taken from the workbook only. Exact skill matches are preferred before semantic ranking.

## Roadmap

Roadmap hours are capped by days remaining × daily study hours.

## Limitations

No historical click/completion labels for resources are present, so recommendation Precision@K/Recall@K/NDCG/MRR are not claimed. Company-role profiles are historical dataset patterns, not official hiring requirements.

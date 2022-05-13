# ```vertexai-notebook-review``` GitHub Action

GitHub action to trigger an asynchronous execution of a Jupyter Notebook via [Google Cloud Vertex AI][vertex-ai].

Notebooks executed by this action will fall under the [notebook executor requirements][nbexecution] defined by Vertex AI.

# Prerequisites

This action requires Google Cloud credentials to execute gcloud commands. See [setup-gcloud][setup-gcloud] for details.

# Setup

1.  Create a new Google Cloud Project (or select an existing project) and
    [enable the Vertex AI APIs][vertex-api].

1.  Create or reuse a GitHub repository for the example workflow:

    1.  [Create a repository][newrepo].

    1.  Move into the repository directory:

        ```
        $ cd <repo>
        ```

    1.  Copy the example into the repository:

        ```
        $ cp -r <path_to>/notebook-review-action/examples/notebook-review/ .
        ```

1.  [Create a GCS bucket][bucket] if one does not already exist.

1.  [Create a Google Cloud service account][create-sa] if one does not already exist.

1.  Add the following [Cloud IAM roles][roles] to your service account:

    - `roles/aiplatform.user` - allows running jobs in Vertex AI
    - `roles/storage.objectWriter` - allows writing notebook files to object storage

    **Note:** *These permissions are overly broad to favor a quick start. They do not represent best practices around the Principle of Least Privilege. To properly restrict access, you should create a custom IAM role with the most
    restrictive permissions.*

1.  [Setup authenticaion to Google Cloud][auth] using workload identity federation with the above service account.

# Usage

```yaml
 jobs:
   notebook-review:
    name: Notebook Review
    needs: changes
    runs-on: ubuntu-latest

    steps:
    - id: 'auth'
      name: 'Authenticate to Google Cloud'
      uses: 'google-github-actions/auth@b258a9f230b36c9fa86dfaa43d1906bd76399edb'
      with:
        workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider'
        service_account: 'my-service-account@my-project.iam.gserviceaccount.com'

    - id: notebook-review
      uses: abcxyz/vertexai-notebook-review@v1
        with:
          gcs-source-bucket: '${{ env.GCS_SOURCE }}'
          gcs-output-bucket: '${{ env.GCS_OUTPUT }}'
          allowlist: '${{ needs.changes.outputs.notebooks_files }}'
```

See a more complete example in [examples](examples/.github/workflows/notebook-review.yml)

# Inputs
gcs-source-bucket: (Required) Google Cloud Storage bucket to store notebooks to be run by Vertex AI. e.g. mygcp-bucket-0001/nbr/source. This bucket was created during setup above.

gcs-output-bucket: (Required) Google Cloud Storage bucket to store the results of the notebooks executed by Vertex AI. e.g. mygcp-bucket-0001/nbr/output. This bucket was created during setup above.

** Note:** It is recommended that the source and output values share the same bucket and utilize a path structure to seperate source from output. 

region: (Optional) Google Cloud region to execute Vertex AI jobs in. Defaults to ```us-central1```.

vertex-machine-type: (Optional) Machine type to use for Vertex AI job execution. Defaults to a ```n1-standard-4``` machine shape.

allowlist: (Required) List of notebooks to execute. Comma separated list of files to run on Vertex AI. e.g. mynotebook.ipynb,somedir/another_notebook.pynb. It is expected that this is the output from an action like [dorny/paths-filter][path-filter].


[bucket]: https://cloud.google.com/storage/docs/creating-buckets
[auth]: https://github.com/google-github-actions/auth
[sdk]: https://cloud.google.com/sdk
[roles]: https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource
[vertex-api]: https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com
[vertex-ai]: https://cloud.google.com/vertex-ai
[newrepo]: https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-new-repository
[nbexecution]: https://cloud.google.com/vertex-ai/docs/workbench/managed/executor#requirements
[path-filter]: https://github.com/dorny/paths-filter
[setup-gcloud]: https://github.com/google-github-actions/setup-gcloud
# `run-vertexai-notebook` GitHub Action

GitHub composite action to trigger asynchronous execution of a Jupyter Notebook via [Google Cloud Vertex AI][vertex-ai].

The typical SDLC for a Jupyter Notebook includes source control of the notebook file without it's output cells. It is a best practice that notebooks should be stored this way to prevent commiting potentially sensitive data. A downside of this practice is that code reviewers will not be able to see the output while reviewing and may not be able to accurately gauge the impact of a change.

The main purpose of this action is to provide a secure way to execute a notebook, store the output (outside of source control), and serve it to a reviewer with proper access controls. 

This action relies on the notebook execution functionality of Google Cloud's Vertex AI to execute the notebook and store the executed notebook with output cells in Google Cloud Storage. Access to the output is controled by Google Cloud Storage ACLs.

**NOTE:** *Notebooks executed by this action will fall under the [notebook executor requirements][nbexecution] defined by Vertex AI.*

This action will provision cloud resources with associated costs so it is recommended that you control the usage of this action by:

* Limiting the triggers of this action: e.g. on pull request with a specific label

* Limiting the set of notebooks that it executes for via the `allowlist` parameter

* Managing the size of the Vertex AI infrastructure via the `vertex_machine_type` parameter 

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
      uses: 'google-github-actions/auth@v0'
      with:
        workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider'
        service_account: 'my-service-account@my-project.iam.gserviceaccount.com'

    - id: notebook-review
      uses: google-github-actions/run-vertexai-notebook@v0
        with:
          gcs_source_bucket: '${{ env.GCS_SOURCE }}'
          gcs_output_bucket: '${{ env.GCS_OUTPUT }}'
          allowlist: '${{ needs.changes.outputs.notebooks_files }}'
```

### Running `R` notebooks

R requires a different base container and kernel

```yaml
    - id: notebook-review
      uses: google-github-actions/run-vertexai-notebook@v0
        with:
          gcs_source_bucket: '${{ env.GCS_SOURCE }}'
          gcs_output_bucket: '${{ env.GCS_OUTPUT }}'
          allowlist: '${{ needs.changes.outputs.notebooks_files }}'
          vertex_container_name: 'gcr.io/deeplearning-platform-release/r-cpu.4-1:latest' # R base container
          kernel: 'ir' # The stock R kernel
```

See a more complete example in [examples](examples/.github/workflows/notebook-review.yml).

# Inputs

-   `gcs_source_bucket` - (Required) Google Cloud Storage bucket to store
    notebooks to be run by Vertex AI. e.g. mygcp-bucket-0001/nbr/source. This
    bucket was created during setup above.

-   `gcs_output_bucket` - (Required) Google Cloud Storage bucket to store the
    results of the notebooks executed by Vertex AI. e.g.
    mygcp-bucket-0001/nbr/output. This bucket was created during setup above.

    **Note:** It is recommended that the source and output values share the
    same bucket and utilize a path structure to seperate source from output.

-   region: (Optional) Google Cloud region to execute Vertex AI jobs in.
    Defaults to `us-central1`.

-   `vertex_machine_type` - (Optional) Machine type to use for Vertex AI job
    execution. Defaults to a `n1-standard-4` machine shape.

-   `allowlist` - (Required) List of notebooks to execute. Comma separated list
    of files to run on Vertex AI. e.g.
    mynotebook.ipynb,somedir/another_notebook.pynb. It is expected that this is
    the output from an action like [dorny/paths-filter][path-filter].

-   `add_comment` - (Optional) By default the action will attempt to write a
    comment to the open PR or issue that triggered this action. This flag allows 
    workflows that are triggered on direct push to a branch to disable this behavior.

-   `kernel` - (Optional) Kernel to use as the environment for the notebook
    when it executes. Defaults to `python3`.

-   `vertex_container_name` - (Optional) The base container to use for the notebook 
    execution job. Defaults to `gcr.io/deeplearning-platform-release/base-cu110:latest`

[bucket]: https://cloud.google.com/storage/docs/creating-buckets
[auth]: https://github.com/google-github-actions/auth
[sdk]: https://cloud.google.com/sdk
[roles]: https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource
[vertex-api]: https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com
[vertex-ai]: https://cloud.google.com/vertex-ai
[newrepo]: https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-new-repository
[nbexecution]: https://cloud.google.com/vertex-ai/docs/workbench/managed/executor#requirements
[path-filter]: https://github.com/dorny/paths-filter
[create-sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[setup-gcloud]: https://github.com/google-github-actions/setup-gcloud

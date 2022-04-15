# Notebook Review - GitHub Actions

An example workflow that uses [GitHub Actions][actions] to schedule a run of any Notebook files
via Vertex AI and then adding a link to the output files back into the pull request.

This code is intended to be an _example_. You will likely need to change or
update values to match your setup.

## Workflow description

For pull requests to the `main` branch, this workflow will:

1.  Download and configure the Google [Cloud SDK][sdk] with the provided
    credentials.

1.  Copy any notebooks found in the PR to a Google Cloud Storage bucket

1.  Create a Vertex AI custom job to execute the notebooks

1.  Provide a link to the job and the expected output file as a comment in the PR

## Setup

1.  Create a new Google Cloud Project (or select an existing project) and
    [enable the Vertex AI APIs](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com).

1.  Create or reuse a GitHub repository for the example workflow:

    1.  [Create a repository](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-new-repository).

    1.  Move into the repository directory:

        ```
        $ cd <repo>
        ```

    1.  Copy the example into the repository:

        ```
        $ cp -r <path_to>/github-actions/example-workflows/notebook-review/ .
        ```

1.  [Create a GCS bucket][bucket] if one does not already exist.

1.  [Create a Google Cloud service account][create-sa] if one does not already
    exist.

1.  Add the following [Cloud IAM roles][roles] to your service account:

    - `roles/aiplatform.user` - allows running jobs in Vertex AI
    - `roles/storage.objectWriter` - allows writing notebook files to object storage

    **Note:** *These permissions are overly broad to favor a quick start. They do not
    represent best practices around the Principle of Least Privilege. To
    properly restrict access, you should create a custom IAM role with the most
    restrictive permissions.*

1.  [Create a JSON service account key][create-key] for the service account.

    **Note**: *You won't require this if you are using [self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners)*

1.  Add the following secrets to your repository's secrets:

    - `GCP_PROJECT`: Google Cloud project ID

    - `GCP_SA_KEY`: the content of the service account JSON file


1.  Update `.github/workflows/notebook_review.yml` to match the values corresponding to your
    VM:

    - `REGION` - the Vertex AI region to run in

    - `GCS_BUCKET` - the bucket used to store notebook files and their outputs (created above)

## Run the workflow

1.  Add and commit your changes:

    ```text
    $ git add .
    $ git commit -m "Set up GitHub workflow"
    ```

1.  Push to the `main` branch:

    ```text
    $ git push -u origin main
    ```

1. Create a pull request for your commit

1.  View the GitHub Actions Workflow by selecting the `Actions` tab at the top
    of your repository on GitHub. 

[actions]: https://help.github.com/en/categories/automating-your-workflow-with-github-actions
[bucket]: https://cloud.google.com/storage/docs/creating-buckets
[create-sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[create-key]: https://cloud.google.com/iam/docs/creating-managing-service-account-keys
[sdk]: https://cloud.google.com/sdk
[secrets]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets
[roles]: https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource

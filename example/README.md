# Example Notebook Review Workflow

An example workflow that uses the [Vertex Notebook Review Action][action] to schedule the remote execution of Notebook files via Vertex AI.

This code is intended to be an _example_. You will likely need to change or
update values to match your setup.

## Workflow description

For pull requests to the `main` branch with a particular label applied, this workflow will:

1.  Download and configure the Google [Cloud SDK][sdk] with the provided
    credentials.

1.  Copy any notebooks found in the PR to a Google Cloud Storage bucket

1.  Create a Vertex AI custom job to execute the notebooks

1.  Provide a link to the job and the expected output file as a comment in the PR

## Setup

1.  Follow the setup instructions for the [Vertex Notebook Review Action][action]

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

1.  Create a pull request for your commit

1.  Apply the label `notebook-review`

1.  View the GitHub Actions Workflow by selecting the `Actions` tab at the top
    of your repository on GitHub.

1.  View the comment in the pull request for details on your Vertex AI job and your executed notebook.

[action]: https://github.com/google-github-actions/run-vertexai-notebook
[sdk]: https://cloud.google.com/sdk

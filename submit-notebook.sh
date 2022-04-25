#!/bin/sh

commit_sha=$1;
base_sha=$2;

working_dir=".."
allowlist="notebook-allowlist.config";
gcsb_source="bradegler-gong-ghnbr-0001/source";
gcsb_output="bradegler-gong-ghnbr-0001/output";
container="gcr.io/deeplearning-platform-release/base-cu110:latest";
region="us-central1";
machine_type="n1-standard-4";
replica_count=1;
notebooks_view_uri="https://notebooks.cloud.google.com/view";
job_uri_base="https://console.cloud.google.com/vertex-ai/locations";

notebooks=$(git diff --name-only --diff-filter=ACMRT "${commit_sha}" "${base_sha}" | grep .ipynb$ | xargs);

echo "Found the following notebooks as part of this commit [${notebooks}]";
for notebook in ${notebooks}; 
do
    echo "Evaluating notebook [${notebook}]";
    if grep -q "^${notebook}$" "${allowlist}"; then
        echo "Notebook [${notebook}] in allowlist";
        source_file="gs://${gcsb_source}/${commit_sha}/${notebook}";
        gsutil cp "${working_dir}/${notebook}" "${source_file}";
        output_file="gs://${gcsb_output}/${commit_sha}/${notebook}";
        job_name="ghnbr_${commit_sha}_${notebook}";

        output=$(gcloud ai custom-jobs create \
            --region=${region} \
            --display-name="${job_name}" \
            --worker-pool-spec=machine-type="${machine_type}",replica-count="${replica_count}",container-image-uri="${container}" \
            --args=nbexecutor,--input-notebook="${source_file}",--output-notebook="${output_file}",--kernel-name=python3);
        
        job_id=$(echo "${output}" | sed '\[projects.*\/customJobs\/(.*)]');
        job_uri="https://console.cloud.google.com/vertex-ai/locations/us-central1/training/${job_id}";

        output_view_uri="${notebooks_view_uri}/${gcsb_output}/${commit_sha}/${notebook}";
        job_uri="${job_uri_base}/${region}/training/${job_id}";

        echo "Monitor and view your notebook";
        echo "${job_uri}";
        echo "${output_view_uri}";

    fi;

done;
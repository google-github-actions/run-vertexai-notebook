

process.env.training_jobs = '{"jobs":[{"createTime":"2022-04-27T19:42:09.112749Z","displayName":"cb74e2fba6ff5556b102f1b2e8008f014d63a94e:somedir/sample_notebook.ipynb","jobSpec":{"workerPoolSpecs":[{"containerSpec":{"args":["nbexecutor","--input-notebook=gs://be-ml-playground-0001/ghnbr/source/35f27e77ada1421a43573e12b1c84b814bad444d/somedir_sample_notebook.ipynb","--output-notebook=gs://be-ml-playground-0001/ghnbr/output/35f27e77ada1421a43573e12b1c84b814bad444d/somedir_sample_notebook.ipynb","--kernel-name=python3"],"imageUri":"gcr.io/deeplearning-platform-release/base-cu110:latest"},"diskSpec":{"bootDiskSizeGb":100,"bootDiskType":"pd-ssd"},"machineSpec":{"machineType":"n1-standard-4"},"replicaCount":"1"}]},"name":"projects/555802528166/locations/us-central1/customJobs/3967449720120410112","state":"JOB_STATE_PENDING","updateTime":"2022-04-27T19:42:09.112749Z"}]}';
process.env.REGION = "us-central1";
process.env.VERTEX_JOB_URI = "https://console.cloud.google.com/vertex-ai/locations";
process.env.VERTEX_NOTEBOOK_URI = "https://notebooks.cloud.google.com/view";


const region = process.env.REGION;
const notebookUri = process.env.VERTEX_NOTEBOOK_URI;
const vertexUri = process.env.VERTEX_JOB_URI;
const jsonStr = process.env.training_jobs;

const data = JSON.parse(jsonStr);
const jid_re = /\/([0-9]+)$/;
console.log(data.jobs);
for (const ix in data.jobs) {
    const job = data.jobs[ix];
    const nbName = job.displayName.split(":")[1];
    const jobId = job.name.match(jid_re)[0].replace("/", "");
    const outFile = job.jobSpec.workerPoolSpecs[0].containerSpec.args.filter((a) => a.startsWith("--output-notebook=gs://")).map((a) => a.replace("--output-notebook=gs://", ""))[0];
    // console.log(nbName);
    // console.log(jobId);
    // console.log(outFile);
    message = `Automatic running of notebook **${nbName}** underway.

    You can review the status of the job within Vertex AI: [Job ${jobId}](${vertexUri}/${region}/training/${jobId})

    Once complete the notebook with output cells will be available to view [${nbName}](${notebookUri}/${outFile})

    `;
    // console.log(message);
    github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: message,
    });
}
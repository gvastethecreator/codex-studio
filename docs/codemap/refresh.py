"""Regenerate the workflow map with the maintain-code-map toolkit.

Usage: python docs/codemap/refresh.py --tool-dir <maintain-code-map/scripts>
The curated boundaries keep runtime flows visible instead of grouping the entire
server into one node. Evidence is checked before all four artifacts are published.
"""

import argparse
import json
from pathlib import Path
import subprocess
import sys
from datetime import datetime, timezone

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--tool-dir", type=Path, required=True)
args = parser.parse_args()
repo = Path(__file__).resolve().parents[2]
tool = args.tool_dir.resolve() / "codemap_tool.py"
stage = repo / "docs/codemap/.staging"
stage.mkdir(exist_ok=True)
generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

# id, path, type, responsibility, public entry symbol
boundaries = [
    ("job-history", "hooks/useJobHistory.ts", "interface", "Open jobs and filtered terminal history", "useJobHistory"),
    ("generation-ui", "hooks/useGenerationPipeline.ts", "interface", "User generation lifecycle", "useGenerationPipeline"),
    ("generation-run", "services/localGenerationRun.ts", "service", "Persistent generation observation and catalog results", "runLocalGeneration"),
    ("job-client", "services/studio-api/jobs.ts", "service", "Browser job API", "createStudioJob"),
    ("job-routes", "apps/local-server/src/jobRoutes.ts", "interface", "Job intake, inspection and actions", "createJobRoutes"),
    ("job-intake", "apps/local-server/src/persistentJobIntake.ts", "service", "Validate and persist before dispatch", "createPersistentJobIntake"),
    ("worker", "apps/local-server/src/worker.ts", "queue", "Execution, cancellation and recovery ownership", "createWorkerController"),
    ("providers", "apps/local-server/src/providers", "service", "Provider execution adapters and runtime identity", "createExternalGenerationProvider"),
    ("jobs-db", "apps/local-server/src/db/jobs.ts", "database", "Durable job states and checkpoints", "updateJobStatus"),
    ("event-bus", "apps/local-server/src/events.ts", "service", "Revisioned job and catalog events", "publishEvent"),
    ("event-routes", "apps/local-server/src/eventStreamRoutes.ts", "interface", "Bounded SSE delivery and revision handshake", "createEventStreamRoutes"),
    ("job-observer", "services/studioEventSource.ts", "service", "Shared event connection and job reconciliation", "watchJob"),
    ("asset-finalizer", "apps/local-server/src/workerAssetFinalizer.ts", "service", "Resumable asset and catalog finalization", "createWorkerAssetFinalizer"),
    ("catalog", "apps/local-server/src/catalog.ts", "database", "Library catalog truth", "registerCatalogImage"),
    ("styles", "components/recipes/StylesBrowser.tsx", "interface", "Style browsing and selected composition", "StylesBrowser"),
    ("style-editor", "components/recipes/UserStyleEditorSurface.tsx", "interface", "User style draft and save session", "UserStyleEditorSurface"),
    ("style-client", "services/studio-api/userStyles.ts", "service", "User style API", "createUserStylePreset"),
    ("style-routes", "apps/local-server/src/userStyleRoutes.ts", "interface", "Persistent user style CRUD", "createUserStyleRoutes"),
    ("shared", "packages/shared/src", "module", "Provider-independent domain and API contracts", "JobStatus"),
    ("runtime-settings", "apps/local-server/src/providers/runtimeConfig.ts", "service", "Provider readiness and configuration", "getExternalProviderRuntimePreflight"),
]

def evidence(path, symbol):
    return {"status": "verified", "locations": [{"path": path, "symbol": symbol}]}

nodes = []
for node_id, path, kind, boundary, symbol in boundaries:
    source = repo / path
    if source.is_dir():
        candidates = sorted(source.rglob("*.ts"))
        source = next(p for p in candidates if not p.name.endswith(".test.ts") and symbol in p.read_text(encoding="utf-8"))
    source_path = source.relative_to(repo).as_posix()
    tests = sorted(p.relative_to(repo).as_posix() for p in source.parent.glob(source.stem + "*.test.*"))[:3]
    nodes.append(dict(id=node_id, path=path, type=kind, boundary=boundary,
                      entrypoints=[source_path + ":" + symbol], tests=tests,
                      callers=[], callees=[], evidence=evidence(source_path, symbol)))

for node in nodes:
    if node["id"] == "job-history":
        node["entrypoints"].append("components/QueuePanel.tsx:QueuePanel")
        node["evidence"]["locations"].append(dict(path="components/QueuePanel.tsx", symbol="useJobHistory"))
    if node["id"] == "worker":
        node["tests"] = ["apps/local-server/src/workerShutdown.test.ts", "apps/local-server/src/workerAssetFinalizer.test.ts", "apps/local-server/src/workerRouting.test.ts"]
    if node["id"] == "providers":
        node["tests"] = ["apps/local-server/src/providers/comfyExecutor.test.ts", "apps/local-server/src/providers/codexProvider.test.ts", "apps/local-server/src/providers/externalProvider.test.ts"]
        for filename, symbol in [("comfyExecutor.ts", "createComfyWorkflowExecutor"), ("codexProvider.ts", "createCodexGenerationProvider")]:
            path = "apps/local-server/src/providers/" + filename
            node["entrypoints"].append(path + ":" + symbol)
            node["evidence"]["locations"].append(dict(path=path, symbol=symbol))

# from, to, interaction, evidence path and literal
links = [
    ("job-history", "job-client", "calls", "hooks/useJobHistory.ts", "listStudioJobs"),
    ("generation-ui", "generation-run", "calls", "hooks/useGenerationPipeline.ts", "runLocalGenerationWithLifecycle"),
    ("generation-run", "job-client", "calls", "services/localGenerationRun.ts", "createStudioJob"),
    ("generation-run", "job-observer", "calls", "services/localGenerationRun.ts", "watchJob"),
    ("job-client", "job-routes", "calls", "services/studio-api/jobs.ts", "/api/jobs"),
    ("job-routes", "job-intake", "calls", "apps/local-server/src/jobRoutes.ts", "persistentJobIntake.createJob"),
    ("job-routes", "jobs-db", "reads", "apps/local-server/src/jobRoutes.ts", "getJob(jobId)"),
    ("job-routes", "worker", "calls", "apps/local-server/src/jobRoutes.ts", "cancelQueuedOrRunningJob(jobId)"),
    ("job-intake", "jobs-db", "writes", "apps/local-server/src/persistentJobIntake.ts", "const job = createJob("),
    ("job-intake", "worker", "calls", "apps/local-server/src/persistentJobIntake.ts", "enqueueJob(queuedJob)"),
    ("job-intake", "runtime-settings", "calls", "apps/local-server/src/persistentJobIntake.ts", "resolveProviderExecutionBlocker"),
    ("worker", "providers", "calls", "apps/local-server/src/worker.ts", "createExternalGenerationProvider"),
    ("worker", "jobs-db", "writes", "apps/local-server/src/worker.ts", "updateJobStatusFn"),
    ("worker", "asset-finalizer", "calls", "apps/local-server/src/worker.ts", "assetFinalizer.finalizeJobAsset"),
    ("worker", "event-bus", "publishes", "apps/local-server/src/worker.ts", "publishEventFn"),
    ("asset-finalizer", "catalog", "writes", "apps/local-server/src/workerAssetFinalizer.ts", "registerCatalogImage"),
    ("asset-finalizer", "jobs-db", "writes", "apps/local-server/src/workerAssetFinalizer.ts", "updateJobFinalization"),
    ("asset-finalizer", "event-bus", "publishes", "apps/local-server/src/workerAssetFinalizer.ts", "publishEvent('job.completed'"),
    ("event-routes", "event-bus", "subscribes", "apps/local-server/src/eventStreamRoutes.ts", "subscribeEvents(send)"),
    ("job-observer", "event-routes", "subscribes", "services/studioEventSource.ts", "/api/events"),
    ("job-observer", "job-client", "calls", "services/studioEventSource.ts", "./studio-api/jobs"),
    ("styles", "style-editor", "calls", "components/recipes/StylesBrowser.tsx", "<UserStyleEditorSurface"),
    ("styles", "style-client", "calls", "components/recipes/StylesBrowser.tsx", "listUserStylePresets"),
    ("style-editor", "style-client", "calls", "components/recipes/UserStyleEditorSurface.tsx", "createUserStylePreset"),
    ("style-client", "style-routes", "calls", "services/studio-api/userStyles.ts", "/api/styles/user"),
    ("job-routes", "shared", "imports", "apps/local-server/src/jobRoutes.ts", "packages/shared/src/types"),
]
edges = [dict(**{"from": a, "to": b}, type=kind, evidence=evidence(path, symbol))
         for a, b, kind, path, symbol in links]
for node in nodes:
    node["callers"] = sorted([dict(id=e["from"], type=e["type"]) for e in edges if e["to"] == node["id"]], key=lambda x: (x["id"], x["type"]))
    node["callees"] = sorted([dict(id=e["to"], type=e["type"]) for e in edges if e["from"] == node["id"]], key=lambda x: (x["id"], x["type"]))

flows = [
    dict(id="generation", trigger="User starts generation", steps=["generation-ui", "generation-run", "job-client", "job-routes", "job-intake", "worker", "providers"], outcome="Validated persistent job reaches its provider adapter"),
    dict(id="reconciliation", trigger="Observer attaches or recovers its connection", steps=["generation-run", "job-observer", "job-client", "job-routes", "jobs-db"], outcome="Observer reads durable job truth independently of event delivery"),
    dict(id="job-history", trigger="User opens Queue or pages terminal history", steps=["job-history", "job-client", "job-routes", "jobs-db"], outcome="All open work remains visible beside terminal history and authoritative counts"),
    dict(id="finalization-recovery", trigger="Worker resumes a persisted finalization checkpoint", steps=["worker", "asset-finalizer", "catalog"], outcome="Existing asset is finalized into catalog truth"),
    dict(id="user-style-edit", trigger="User opens a style draft and saves", steps=["styles", "style-editor", "style-client", "style-routes"], outcome="User style changes persist through the existing API"),
]
commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo, text=True).strip()
model = dict(generated_at=generated_at, generated_from_commit=commit, scope=["."],
             nodes=sorted(nodes, key=lambda n: n["id"]),
             edges=sorted(edges, key=lambda e: (e["from"], e["to"], e["type"])), flows=flows)
(stage / "codemap.json").write_text(json.dumps(model, indent=2) + "\n", encoding="utf-8")

def run(*arguments):
    subprocess.run([sys.executable, str(tool), *arguments], cwd=repo, check=True)

for command, suffix in [("markdown", "md"), ("render", "html")]:
    run(command, "--repo", ".", "--json", str(stage / "codemap.json"), "--output", str(stage / ("codemap." + suffix)))
run("lock", "--repo", ".", "--scope", ".", "--exclude", "docs/codemap", "--generated-at", generated_at, "--output", str(stage / "codemap.lock"))
for suffix in ("json", "md", "html"):
    artifact = stage / ("codemap." + suffix)
    formatted = subprocess.run(["vp", "fmt", "--stdin-filepath", "docs/codemap/codemap." + suffix],
                               cwd=repo, input=artifact.read_bytes(), stdout=subprocess.PIPE, check=True)
    artifact.write_bytes(formatted.stdout)
run("validate", "--repo", ".", "--dir", str(stage), "--html")
run("publish", "--repo", ".", "--staging", str(stage), "--target", "docs/codemap")

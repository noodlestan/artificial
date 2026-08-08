# Artificial

## Definitions

**Artificial Operation** – Represents an atomic action that an AI Agent can perform.

**Artificial Workflow** – Represents a linear or iterative sequence of Operations that an AI Agent performs sequentially to achieve an outcome.

## Artificial Operations

- Classify Request.
- Identify Intent.
- Identify Constraints.
- Identify Delegation Goal.
- Identify Next Delegation Step.
- Execute Next Delegation Step.
- Process Delegation Outcome.
- Identify Input.
- Evaluate Request Clarity.
- Identify Working Statement.
- Select Next Workflow.
- Update Working Statement.
- Process Additional User Input.
- Extract Findings From Resource.
- Select Next Resources to Explore.
- Select Next Questions to Ask.
- Identify Context Sources.
- Define Exploration Goal.
- Define Inquiry Goal.
- Ask Next Question.
- Execute Exploration Strategy.
- Identify Tools for Exploration.
- Evaluate Tools for Exploration.
- Select Tools for Exploration.
- Select Next Files to Read.
- Select Next Tools to Call.
- Perform Reasoning Pass.
- Evaluate Reasoning Insights.
- Identify Reasoning Goal.
- Evaluate Confidence.
- Refine Instructions.
- Assess Plan State.
- Refine Plan.
- Identify Plan Goal.
- Evaluate Preconditions.
- Execute Plan Steps.
- Execute Verification Step.
- Evaluate Verification Results.
- Detect Issues.
- Select Response Format.
- Generate Response.
- Format Response.
- Send Response.
- Synthesise Response.
- Identify Next Plan Step.
- Execute Next Plan Step.

## Artificial Context Sources

- Additional User Input.
- Resource Findings.
- Reasoning Insights.
- Exploration Findings.
- Plan.
- Execution Results.
- Verification Results.

## Artificial Worfklows

### Worfklow: Handle Request

1. Evaluate Request Clarity.
2. Classify Request.
3. Identify Intent.
4. Identify Constraints.
5. Identify Working Statement.
6. Select Next Workflow.

### Worfklow: Request for Input

1. Identify Input.
2. Define Inquiry Goal.
3. Ask Questions Until (Evaluate Confidence).
4. Consolidate into Context (Additional User Input).
5. Update Working Statement.
6. Select Next Workflow.

### Worfklow: Ask Questions Until (condition)

1. Select Next Questions to Ask.
2. Ask Next Question.
3. Process Additional User Input.
4. Evaluate Condition: (condition). Loop to step 1 if condition not satisfied.

### Worfklow: Autonomous Exploration

1. Define Exploration Goal.
2. Identify Tools for Exploration.
3. Evaluate Tools for Exploration.
4. Select Tools for Exploration.
5. Explore Until (Evaluate Confidence).
6. Consolidate into Context (Exploration Findings).
7. Update Working Statement.
8. Select Next Workflow.

### Worfklow: Explore Until (condition)

1. Select Next Resources to Explore.
   - Select Next Files to Read.
   - Select Next Tools to Call.
2. Extract Findings From Resource.
3. Consolidate into Context (Resource Findings).
4. Evaluate Condition. Loop to step 1 if condition not satisfied.

### Worfklow: Reasoning

1. Identify Reasoning Goal.
2. Reason Until (Evaluate Confidence).
3. Consolidate into Context (Reasoning Insights).
4. Update Working Statement.
5. Select Next Workflow.

### Worfklow: Reason Until (condition)

1. Perform Reasoning Pass.
2. Evaluate Reasoning Insights.
3. Evaluate Condition. Loop to step 1 if condition not satisfied.

### Worfklow: Generate Plan

1. Identify Plan Goal.
2. Refine Plan Until (Evaluate Confidence).
3. Consolidate into Context (Plan).
4. Update Working Statement.
5. Select Next Workflow.

### Workflow: Refine Plan Until (condition)

1. Assess Plan State.
2. Refine Plan.
3. Evaluate Condition. Loop to step 1 if condition not satisfied.

### Worfklow: Execute Plan

1. Evaluate Preconditions.
2. Execute Plan Steps.
3. Consolidate into Context (Execution Results).
4. Update Working Statement.
5. Select Next Workflow.

### Workflow: Execute Plan Steps

1. Identify Next Plan Step.
2. Execute Next Plan Step.
3. Execute Verification Step.
4. Evaluate Verification Results.
5. Consolidate into Context (Verification Results).
6. Evaluate Condition: (No More Steps). Loop to step 1 if condition not satisfied.

### Worfklow: Delegate

1. Identify Delegation Goal.
2. Execute Delegation Steps.
3. Consolidate into Context (Delegation Results).
4. Update Working Statement.
5. Select Next Workflow.

### Workflow: Execute Delegation Steps

1. Identify Next Delegation Step.
2. Execute Next Delegation Step.
3. Process Delegation Outcome.
4. Evaluate Condition: (No More Steps). Loop to step 1 if condition not satisfied.

### Worfklow: Respond

1. Synthesise Response.
2. Select Response Format.
3. Generate Response.
4. Format Response.
5. Send Response.

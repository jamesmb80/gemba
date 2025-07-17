# Quality Gate Validation Command

Validates feature ideas against comprehensive quality criteria before implementation.

## Usage
```
/project:quality-check
```

## Quality Validation Process

When invoked after a CCI research phase, this command:

1. **Extracts Feature Details** from the research
2. **Runs Quality Gate Checks** against all criteria
3. **Generates Quality Report** with pass/fail status
4. **Provides Recommendations** for improvements
5. **Creates Implementation Templates** if passed

## Quality Gate Categories

### 1. Technical Quality
- Performance impact assessment
- Security vulnerability check
- Code complexity analysis
- Dependency evaluation
- API design validation

### 2. Manufacturing Compatibility
- Offline operation capability
- Touch interface optimization
- Environmental durability
- Safety compliance check
- Operator workflow impact

### 3. Testing Coverage
- Unit test feasibility
- Integration test requirements
- E2E scenario coverage
- Performance test needs
- Manufacturing scenario tests

### 4. Accessibility & UX
- WCAG 2.1 AA compliance check
- Keyboard navigation feasibility
- Screen reader compatibility
- Touch target size validation
- High contrast mode support

### 5. Implementation Readiness
- Clear acceptance criteria
- Technical approach defined
- Dependencies identified
- Risk assessment complete
- Rollback strategy exists

## Scoring System

Each category is scored:
- **Pass** (✅): Meets all requirements
- **Warning** (⚠️): Minor issues to address
- **Fail** (🚫): Blocking issues found

Overall assessment:
- **Green**: 90%+ pass rate → Ready for implementation
- **Yellow**: 70-89% pass rate → Address warnings first
- **Red**: <70% pass rate → Requires redesign

## Output Format

```markdown
# Quality Gate Report: [Feature Name]

## Overall Score: 85% (YELLOW)

### ✅ Passed (17/20)
- Performance: Async implementation prevents blocking
- Security: Input validation specified
- Manufacturing: Offline-first design
[... more items ...]

### ⚠️ Warnings (2/20)
- Test Coverage: Edge cases for network failure needed
- Documentation: API examples incomplete

### 🚫 Failed (1/20)
- Accessibility: Color contrast ratio too low

## Recommendations
1. Increase button contrast to 4.5:1 ratio
2. Add network failure simulation tests
3. Include curl examples in API docs

## Next Steps
- Address failed items before implementation
- Consider warnings for better quality
- Use provided templates for consistency
```

## Integration with CCI

This command is automatically invoked after CCI research phase:
1. CCI performs research and analysis
2. Quality-check validates the findings
3. If passed, creates issue with templates
4. If failed, provides improvement guidance

## Manufacturing-Specific Checks

Special validation for industrial environments:
- Glove-friendly touch targets (min 44x44px)
- Visibility in bright light conditions
- Dust/water resistance considerations
- Emergency stop integration
- Shift handover data persistence
- Multi-language support readiness

## Continuous Improvement

Quality gates are refined based on:
- Production bug analysis
- Operator feedback
- Performance metrics
- Safety incident reports
- Implementation time data

This ensures the framework evolves with real-world usage.
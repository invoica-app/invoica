# AI Invoice Replicator — Gap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the remaining gaps in the AI Invoice Replicator so users can upload an invoice image, get it analyzed by Claude Vision, see it mapped to the closest existing template with extracted colors/font, and adopt it as their current invoice — with PRO users getting unlimited analyses.

**Architecture:** Backend adds a `plan` column to users (FREE/PRO), a `TemplateMappingService` that scores Claude's analysis JSON against the 5 existing templates, and a new `/api/ai/map-template` endpoint. Frontend consolidates routes, adds an "Apply to Invoice" flow that writes the mapped template + customizations into the Zustand invoice store, and respects the user's plan tier for usage gating.

**Tech Stack:** Kotlin/Spring Boot, Flyway, PostgreSQL, Next.js 14, Zustand, TypeScript

---

## File Structure

### Backend — New Files
- `backend/src/main/resources/db/migration/V15__add_user_plan_column.sql` — Flyway migration adding `plan` column
- `backend/src/main/kotlin/com/invoicer/service/TemplateMappingService.kt` — Maps AI analysis → closest TemplateId + customizations

### Backend — Modified Files
- `backend/src/main/kotlin/com/invoicer/entity/User.kt` — Add `plan` field + `UserPlan` enum
- `backend/src/main/kotlin/com/invoicer/dto/AuthDto.kt` — Add `plan` to `UserDto`
- `backend/src/main/kotlin/com/invoicer/dto/AiDto.kt` — Add `AiTemplateMappingResponse`
- `backend/src/main/kotlin/com/invoicer/service/AuthService.kt` — Include `plan` in `User.toDto()`
- `backend/src/main/kotlin/com/invoicer/service/AiFeatureService.kt` — Skip usage check for PRO; add `mapTemplate()` method
- `backend/src/main/kotlin/com/invoicer/controller/AiController.kt` — Add `/map-template` endpoint
- `backend/src/main/kotlin/com/invoicer/repository/UserRepository.kt` — Add `findById` usage (already from JpaRepository)

### Frontend — Modified Files
- `frontend/lib/types.ts` — Add `UserPlan` type, `AiTemplateMappingResponse` interface, add `plan` to user types
- `frontend/lib/api.ts` — Add `mapTemplate()` API call
- `frontend/lib/hooks/use-api.ts` — Expose `mapTemplate`
- `frontend/app/invoice/new/ai-replicator/page.tsx` — Add "Apply to Invoice" flow after preview
- `frontend/app/invoice/new/ai-replicator/components/preview-step.tsx` — Add "Use This Template" button

### Frontend — Deleted
- `frontend/app/ai-replicator/` — Remove duplicate route (entire directory)

---

### Task 1: Flyway Migration — Add `plan` Column to Users

**Files:**
- Create: `backend/src/main/resources/db/migration/V15__add_user_plan_column.sql`

- [ ] **Step 1: Create the migration file**

```sql
ALTER TABLE users ADD COLUMN plan VARCHAR(10) NOT NULL DEFAULT 'FREE';
```

- [ ] **Step 2: Verify migration numbering**

Run: `ls backend/src/main/resources/db/migration/`
Expected: V15 is the next sequential number after V14__drop_global_invoice_number_unique_constraints.sql

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/resources/db/migration/V15__add_user_plan_column.sql
git commit -m "feat: add plan column to users table (V15 migration)"
```

---

### Task 2: User Entity — Add `UserPlan` Enum and `plan` Field

**Files:**
- Modify: `backend/src/main/kotlin/com/invoicer/entity/User.kt`

- [ ] **Step 1: Add `UserPlan` enum and `plan` field to User entity**

Add the enum after the existing `AuthProvider` enum:

```kotlin
enum class UserPlan {
    FREE,
    PRO
}
```

Add this field to the `User` class constructor, after the `isDisabled` field:

```kotlin
    @Column(name = "plan", nullable = false)
    @Enumerated(EnumType.STRING)
    var plan: UserPlan = UserPlan.FREE,
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/kotlin/com/invoicer/entity/User.kt
git commit -m "feat: add UserPlan enum and plan field to User entity"
```

---

### Task 3: DTOs — Add `plan` to UserDto and Create AiTemplateMappingResponse

**Files:**
- Modify: `backend/src/main/kotlin/com/invoicer/dto/AuthDto.kt`
- Modify: `backend/src/main/kotlin/com/invoicer/dto/AiDto.kt`

- [ ] **Step 1: Add `plan` field to `UserDto`**

In `AuthDto.kt`, add `plan` to the `UserDto` data class:

```kotlin
data class UserDto(
    val id: Long,
    val email: String,
    val name: String,
    val provider: AuthProvider,
    val isGuest: Boolean,
    val isAdmin: Boolean = false,
    val plan: String = "FREE"
)
```

- [ ] **Step 2: Add `AiTemplateMappingResponse` to `AiDto.kt`**

Append to the file:

```kotlin
data class AiTemplateMappingResponse(
    val templateId: String,
    val primaryColor: String,
    val fontFamily: String,
    val confidence: Double,
    val reasoning: String
)
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/kotlin/com/invoicer/dto/AuthDto.kt backend/src/main/kotlin/com/invoicer/dto/AiDto.kt
git commit -m "feat: add plan to UserDto and AiTemplateMappingResponse DTO"
```

---

### Task 4: AuthService — Include `plan` in User-to-DTO Mapping

**Files:**
- Modify: `backend/src/main/kotlin/com/invoicer/service/AuthService.kt`

- [ ] **Step 1: Update the `User.toDto()` extension function**

Change the existing `toDto` function (at the bottom of `AuthService.kt`) to include `plan`:

```kotlin
    private fun User.toDto(isAdmin: Boolean = false) = UserDto(
        id = id,
        email = email,
        name = name,
        provider = provider,
        isGuest = isGuest,
        isAdmin = isAdmin,
        plan = plan.name
    )
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/kotlin/com/invoicer/service/AuthService.kt
git commit -m "feat: include user plan in auth responses"
```

---

### Task 5: TemplateMappingService — Map AI Analysis to Existing Templates

**Files:**
- Create: `backend/src/main/kotlin/com/invoicer/service/TemplateMappingService.kt`

- [ ] **Step 1: Create the template mapping service**

```kotlin
package com.invoicer.service

import com.invoicer.dto.AiTemplateMappingResponse
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Service

@Service
class TemplateMappingService(
    private val objectMapper: ObjectMapper
) {
    data class TemplateProfile(
        val id: String,
        val layoutStyle: String,
        val hasHeaderBar: Boolean,
        val prefersSansSerif: Boolean,
        val prefersMinimal: Boolean,
        val prefersFormality: Int // 1=casual, 5=formal
    )

    private val templates = listOf(
        TemplateProfile("modern", "modern", hasHeaderBar = true, prefersSansSerif = true, prefersMinimal = false, prefersFormality = 3),
        TemplateProfile("classic", "classic", hasHeaderBar = false, prefersSansSerif = false, prefersMinimal = false, prefersFormality = 4),
        TemplateProfile("enterprise", "corporate", hasHeaderBar = true, prefersSansSerif = true, prefersMinimal = false, prefersFormality = 5),
        TemplateProfile("freelancer", "minimal", hasHeaderBar = false, prefersSansSerif = true, prefersMinimal = true, prefersFormality = 1),
        TemplateProfile("corporate", "corporate", hasHeaderBar = true, prefersSansSerif = true, prefersMinimal = false, prefersFormality = 4)
    )

    fun mapTemplate(analysisJson: String): AiTemplateMappingResponse {
        val analysis = objectMapper.readTree(analysisJson)
        val layout = analysis.get("layout")
        val typography = analysis.get("typography")

        val scores = templates.map { template ->
            val score = scoreTemplate(template, layout, typography)
            template to score
        }.sortedByDescending { it.second }

        val best = scores.first()
        val primaryColor = extractPrimaryColor(layout)
        val fontFamily = mapFontFamily(typography)

        return AiTemplateMappingResponse(
            templateId = best.first.id,
            primaryColor = primaryColor,
            fontFamily = fontFamily,
            confidence = best.second.coerceIn(0.0, 1.0),
            reasoning = buildReasoning(best.first, layout)
        )
    }

    private fun scoreTemplate(template: TemplateProfile, layout: JsonNode?, typography: JsonNode?): Double {
        var score = 0.0

        val style = layout?.get("style")?.asText() ?: "modern"
        if (style == template.layoutStyle) score += 0.4
        else if (isRelatedStyle(style, template.layoutStyle)) score += 0.2

        val hasHeader = layout?.get("hasHeaderBar")?.asBoolean() ?: false
        if (hasHeader == template.hasHeaderBar) score += 0.15

        val headingFont = typography?.get("headingFont")?.asText() ?: "sans-serif"
        val isSansSerif = headingFont == "sans-serif"
        if (isSansSerif == template.prefersSansSerif) score += 0.1

        val headingSize = typography?.get("headingSize")?.asText() ?: "medium"
        val isMinimal = headingSize == "small"
        if (isMinimal == template.prefersMinimal) score += 0.1

        val alignment = layout?.get("alignment")?.asText() ?: "left"
        if (alignment == "center" && template.prefersFormality >= 4) score += 0.05
        if (alignment == "left" && template.prefersFormality <= 3) score += 0.05

        val uppercase = typography?.get("uppercase")?.asBoolean() ?: false
        if (uppercase && template.prefersFormality >= 4) score += 0.1
        if (!uppercase && template.prefersFormality <= 2) score += 0.1

        return score
    }

    private fun isRelatedStyle(detected: String, templateStyle: String): Boolean {
        val related = mapOf(
            "modern" to setOf("minimal", "creative"),
            "classic" to setOf("corporate"),
            "corporate" to setOf("classic"),
            "minimal" to setOf("modern", "creative"),
            "creative" to setOf("modern", "minimal")
        )
        return related[detected]?.contains(templateStyle) == true
    }

    private fun extractPrimaryColor(layout: JsonNode?): String {
        return layout?.get("colorScheme")?.get("primary")?.asText() ?: "#7C3AED"
    }

    private fun mapFontFamily(typography: JsonNode?): String {
        val headingFont = typography?.get("headingFont")?.asText() ?: "sans-serif"
        return when (headingFont) {
            "serif" -> "Georgia"
            "monospace" -> "JetBrains Mono"
            else -> "Inter"
        }
    }

    private fun buildReasoning(template: TemplateProfile, layout: JsonNode?): String {
        val style = layout?.get("style")?.asText() ?: "unknown"
        return "Matched '${template.id}' template based on detected '$style' layout style"
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/kotlin/com/invoicer/service/TemplateMappingService.kt
git commit -m "feat: add TemplateMappingService to map AI analysis to existing templates"
```

---

### Task 6: AiFeatureService — PRO Tier Gating + mapTemplate Method

**Files:**
- Modify: `backend/src/main/kotlin/com/invoicer/service/AiFeatureService.kt`

- [ ] **Step 1: Add UserRepository and TemplateMappingService dependencies**

Update the constructor to add the new dependencies:

```kotlin
@Service
class AiFeatureService(
    private val aiFeatureUsageRepository: AiFeatureUsageRepository,
    private val aiGeneratedTemplateRepository: AiGeneratedTemplateRepository,
    private val claudeVisionService: ClaudeVisionService,
    private val storageService: StorageService,
    private val anthropicConfig: AnthropicConfig,
    private val userRepository: UserRepository,
    private val templateMappingService: TemplateMappingService
)
```

Add imports at top:

```kotlin
import com.invoicer.dto.AiTemplateMappingResponse
import com.invoicer.entity.UserPlan
import com.invoicer.repository.UserRepository
```

- [ ] **Step 2: Update usage check in `analyzeInvoice` to skip for PRO users**

Replace the usage check block (lines 47-49) with:

```kotlin
        // Check usage — PRO users get unlimited
        val user = userRepository.findById(userId).orElseThrow { RuntimeException("User not found") }
        if (user.plan != UserPlan.PRO) {
            val usageCount = aiFeatureUsageRepository.countByUserIdAndFeatureAndSuccessTrue(userId, FEATURE_NAME)
            if (usageCount >= anthropicConfig.maxFreeUses) {
                throw AiUsageExhaustedException("You have used all ${anthropicConfig.maxFreeUses} free AI analyses. Upgrade to continue.")
            }
        }
```

Also update the `usageCount` variable used later in the return statement. Move it above the return:

```kotlin
            val usageCount = aiFeatureUsageRepository.countByUserIdAndFeatureAndSuccessTrue(userId, FEATURE_NAME)
```

- [ ] **Step 3: Update `getUsage` to reflect PRO status**

Replace the `getUsage` method:

```kotlin
    fun getUsage(userId: Long): AiUsageResponse {
        val user = userRepository.findById(userId).orElseThrow { RuntimeException("User not found") }
        val usageCount = aiFeatureUsageRepository.countByUserIdAndFeatureAndSuccessTrue(userId, FEATURE_NAME)
        val maxFreeUses = anthropicConfig.maxFreeUses
        val isPro = user.plan == UserPlan.PRO
        val remaining = if (isPro) Long.MAX_VALUE else (maxFreeUses - usageCount).coerceAtLeast(0)
        return AiUsageResponse(
            usageCount = usageCount,
            maxFreeUses = if (isPro) Int.MAX_VALUE else maxFreeUses,
            remaining = remaining,
            isExhausted = !isPro && remaining <= 0
        )
    }
```

- [ ] **Step 4: Add `mapTemplate` method**

Add after `getTemplates`:

```kotlin
    fun mapTemplate(analysisJson: String): AiTemplateMappingResponse {
        return templateMappingService.mapTemplate(analysisJson)
    }
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/kotlin/com/invoicer/service/AiFeatureService.kt
git commit -m "feat: PRO tier bypass for usage limits and template mapping in AiFeatureService"
```

---

### Task 7: AiController — Add `/map-template` Endpoint

**Files:**
- Modify: `backend/src/main/kotlin/com/invoicer/controller/AiController.kt`

- [ ] **Step 1: Add the map-template endpoint**

Add this import:

```kotlin
import com.invoicer.dto.AiTemplateMappingResponse
```

Add this endpoint method after `getTemplates`:

```kotlin
    @PostMapping("/map-template")
    fun mapTemplate(
        @RequestBody body: Map<String, String>,
        authentication: Authentication
    ): ResponseEntity<AiTemplateMappingResponse> {
        val analysisJson = body["analysisJson"]
            ?: return ResponseEntity.badRequest().build()
        val result = aiFeatureService.mapTemplate(analysisJson)
        return ResponseEntity.ok(result)
    }
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/kotlin/com/invoicer/controller/AiController.kt
git commit -m "feat: add POST /api/ai/map-template endpoint"
```

---

### Task 8: Frontend Types — Add Plan and Template Mapping Types

**Files:**
- Modify: `frontend/lib/types.ts`

- [ ] **Step 1: Add `UserPlan` type and `AiTemplateMappingResponse` interface**

After the `TemplateId` type definition (line 4), add:

```typescript
export type UserPlan = 'FREE' | 'PRO';
```

After the `AiTemplateResponse` interface (around line 304), add:

```typescript
export interface AiTemplateMappingResponse {
  templateId: TemplateId;
  primaryColor: string;
  fontFamily: string;
  confidence: number;
  reasoning: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/lib/types.ts
git commit -m "feat: add UserPlan and AiTemplateMappingResponse frontend types"
```

---

### Task 9: Frontend API — Add `mapTemplate` Method

**Files:**
- Modify: `frontend/lib/api.ts`
- Modify: `frontend/lib/hooks/use-api.ts`

- [ ] **Step 1: Add `AiTemplateMappingResponse` import and API method**

In `frontend/lib/api.ts`, add `AiTemplateMappingResponse` to the imports from `./types`:

```typescript
import {
  // ... existing imports ...
  AiTemplateMappingResponse,
} from './types';
```

Add this method to the `ApiClient` class, after `getAiTemplates`:

```typescript
  async mapTemplate(analysisJson: string): Promise<AiTemplateMappingResponse> {
    return this.request<AiTemplateMappingResponse>('/ai/map-template', {
      method: 'POST',
      body: JSON.stringify({ analysisJson }),
    });
  }
```

- [ ] **Step 2: Expose in the `aiApi` export and `useAuthenticatedApi` hook**

In `frontend/lib/api.ts`, add to the `aiApi` object:

```typescript
  mapTemplate: (analysisJson: string) => api.mapTemplate(analysisJson),
```

In `frontend/lib/hooks/use-api.ts`, add to the returned object:

```typescript
    mapTemplate: (analysisJson: string) => aiApi.mapTemplate(analysisJson),
```

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/api.ts frontend/lib/hooks/use-api.ts
git commit -m "feat: add mapTemplate API method and hook"
```

---

### Task 10: Preview Step — Add "Use This Template" Button

**Files:**
- Modify: `frontend/app/invoice/new/ai-replicator/components/preview-step.tsx`

- [ ] **Step 1: Add template application logic**

Add imports at the top:

```typescript
import { useRouter } from "next/navigation";
import { useInvoiceStore } from "@/lib/store";
import { useAuthenticatedApi } from "@/lib/hooks/use-api";
import type { TemplateId } from "@/lib/types";
import { Wand2 } from "lucide-react";
```

Note: `useAuthenticatedApi` is already imported. Just add `useRouter`, `useInvoiceStore`, `TemplateId`, and `Wand2`.

Add state and handler inside the `PreviewStep` component:

```typescript
  const router = useRouter();
  const { setDesign } = useInvoiceStore();
  const [applying, setApplying] = useState(false);

  const handleApplyTemplate = async () => {
    setApplying(true);
    try {
      const mapping = await api.mapTemplate(analysisJson);
      setDesign(
        mapping.primaryColor,
        mapping.fontFamily,
        mapping.templateId as TemplateId
      );
      router.push("/invoice/new/design");
    } catch (err) {
      console.error("Template mapping failed:", err);
    } finally {
      setApplying(false);
    }
  };
```

- [ ] **Step 2: Add the button to the UI**

In the button group (after the "Start Over" button), add:

```tsx
          <Button size="sm" variant="default" onClick={handleApplyTemplate} disabled={applying}>
            <Wand2 className="w-4 h-4 mr-1.5" />
            {applying ? "Applying..." : "Use This Template"}
          </Button>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/invoice/new/ai-replicator/components/preview-step.tsx
git commit -m "feat: add 'Use This Template' button to apply AI analysis to invoice"
```

---

### Task 11: Route Consolidation — Remove Duplicate `/app/ai-replicator/`

**Files:**
- Delete: `frontend/app/ai-replicator/` (entire directory)

- [ ] **Step 1: Verify the wizard route is the correct one**

Run: `grep -rn "ai-replicator" frontend/components/wizard-sidebar.tsx`
Expected: Sidebar links to `/invoice/new/ai-replicator`

Run: `ls frontend/app/invoice/new/ai-replicator/`
Expected: page.tsx, loading.tsx, components/

- [ ] **Step 2: Check for any references to the old root route**

Run: `grep -rn "/ai-replicator" frontend/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v "invoice/new/ai-replicator"`

If any files reference `/ai-replicator` (without `/invoice/new/` prefix), update them to point to `/invoice/new/ai-replicator`.

- [ ] **Step 3: Delete the duplicate route**

```bash
rm -rf frontend/app/ai-replicator/
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove duplicate /ai-replicator route, consolidate to /invoice/new/ai-replicator"
```

---

### Task 12: Integration Test — End-to-End Verification

- [ ] **Step 1: Start the backend**

Run: `cd backend && ./gradlew bootRun`

Verify: No Flyway migration errors, V15 applies cleanly.

- [ ] **Step 2: Verify the new endpoint works**

Run (with a valid JWT token):
```bash
curl -X POST http://localhost:8080/api/ai/map-template \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"analysisJson": "{\"layout\":{\"style\":\"modern\",\"colorScheme\":{\"primary\":\"#2563EB\"},\"hasHeaderBar\":true},\"typography\":{\"headingFont\":\"sans-serif\",\"headingSize\":\"large\",\"uppercase\":false},\"tableStyle\":{},\"sections\":[],\"detectedCurrency\":\"USD\",\"specialFeatures\":{}}"}'
```

Expected: 200 OK with a JSON response containing `templateId`, `primaryColor`, `fontFamily`, `confidence`, `reasoning`.

- [ ] **Step 3: Start the frontend and test the flow**

Run: `cd frontend && npm run dev`

1. Navigate to `/invoice/new/ai-replicator`
2. Upload an invoice image
3. Fill in the form step
4. On the preview step, click "Use This Template"
5. Verify you're redirected to `/invoice/new/design` with the mapped template, color, and font applied

- [ ] **Step 4: Verify route consolidation**

Navigate to `/ai-replicator` — should 404 (old route removed).
Navigate to `/invoice/new/ai-replicator` — should load the AI replicator page within the wizard layout.

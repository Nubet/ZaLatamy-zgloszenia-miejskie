import type { AnalysisGateway } from "@/application/analysis/port";
import { categories } from "@/domain/reports/model";

const titles = {
    road: "Uszkodzona nawierzchnia chodnika",
    lighting: "Niedziałająca latarnia uliczna",
    waste: "Odpady w przestrzeni publicznej",
    greenery: "Uszkodzona zieleń przy alejce",
    other: "Uszkodzony element wyposażenia miejskiego",
};
export const mockAnalysis: AnalysisGateway = {
    async analyze(_photo, scenario) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (scenario === "error")
            throw new Error(
                "Nie udało się przygotować opisu. Spróbuj ponownie lub uzupełnij go samodzielnie.",
            );
        return {
            title: titles[scenario],
            description: `Zauważono problem w kategorii: ${categories[scenario].toLocaleLowerCase("pl")}. Usterka utrudnia korzystanie z przestrzeni publicznej i wymaga sprawdzenia przez odpowiednie służby miejskie.`,
            category: scenario,
        };
    },
};

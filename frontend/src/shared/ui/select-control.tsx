"use client";

import { Select } from "@base-ui/react/select";
import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";

export type SelectControlProps = {
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    "aria-label"?: string;
    id?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
};

export function SelectControl({
    options,
    "aria-label": ariaLabel,
    onValueChange,
    ...props
}: SelectControlProps) {
    const [portalContainer, setPortalContainer] = useState<HTMLDialogElement | null>(null);
    const attachTrigger = useCallback((element: HTMLButtonElement | null) => {
        // Native modal dialogs make portals outside their top layer inert.
        if (element) setPortalContainer(element.closest("dialog"));
    }, []);

    return (
        <Select.Root
            {...props}
            items={options}
            onValueChange={(value) => {
                if (value !== null) onValueChange(value);
            }}
        >
            <Select.Trigger ref={attachTrigger} className="select-control" aria-label={ariaLabel}>
                <Select.Value className="select-control__value" />
                <Select.Icon className="select-control__icon">
                    <ChevronDown size={12} aria-hidden="true" />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal container={portalContainer ?? undefined}>
                <Select.Positioner
                    className="select-control__positioner"
                    sideOffset={6}
                    align="start"
                    alignItemWithTrigger={false}
                >
                    <Select.Popup className="select-control__popup">
                        <Select.List className="select-control__list">
                            {options.map(({ value, label }) => (
                                <Select.Item
                                    key={value}
                                    value={value}
                                    className="select-control__option"
                                >
                                    <Select.ItemIndicator
                                        className="select-control__indicator"
                                        children={null}
                                    />
                                    <Select.ItemText>{label}</Select.ItemText>
                                </Select.Item>
                            ))}
                        </Select.List>
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    );
}

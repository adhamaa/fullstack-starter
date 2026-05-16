import { cn } from "@/components/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput
} from "@/components/ui/input-group";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { useKcClsx } from "@keycloakify/login-ui/useKcClsx";
import { RotateCcw } from "lucide-react";
import { type ReactNode } from "react";
import { useI18n } from "../../i18n";
import { useKcContext } from "../../KcContext";
import type { TemplateProps } from "./Template";

type TemplateContentProps = TemplateProps & {
    logoWhiteUrl: string;
    logoDarkUrl: string;
    cardClassName?: string;
    brandingVisibilityClassName?: string;
};

export function TemplateContent(props: TemplateContentProps) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        headerNode,
        socialProvidersNode = null,
        infoNode = null,
        children,
        logoWhiteUrl,
        logoDarkUrl,
        cardClassName,
        brandingVisibilityClassName
    } = props;

    const { kcContext } = useKcContext();
    const { auth, url, message, isAppInitiatedAction, realm } = kcContext;
    const { msg, msgStr } = useI18n();
    const { kcClsx } = useKcClsx();

    const titleNode: ReactNode = !(
        auth !== undefined &&
        auth.showUsername &&
        !auth.showResetCredentials
    ) ? (
        <h1 className="text-xl">{headerNode}</h1>
    ) : (
        <div id="kc-username" className="flex w-full flex-col gap-2">
            <FieldLabel htmlFor="kc-attempted-username">
                {msgStr("attemptedUsernameLoggingInAs")}
            </FieldLabel>
            <InputGroup>
                <InputGroupInput
                    id="kc-attempted-username"
                    readOnly
                    value={auth.attemptedUsername ?? ""}
                    aria-readonly="true"
                />
                <InputGroupAddon align="inline-end">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <InputGroupButton size="icon-xs" asChild>
                                    <a
                                        id="reset-login"
                                        href={url.loginRestartFlowUrl}
                                        aria-label={msgStr("restartLoginTooltip")}
                                    >
                                        <RotateCcw />
                                    </a>
                                </InputGroupButton>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{msg("restartLoginTooltip")}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </InputGroupAddon>
            </InputGroup>
        </div>
    );

    return (
        <Card className={cardClassName}>
            <CardHeader>
                <div
                    className={cn(
                        "flex flex-col items-center justify-center gap-3",
                        brandingVisibilityClassName
                    )}
                >
                    <div className="flex items-center gap-3 mb-4 ">
                        <img
                            src={logoWhiteUrl}
                            alt="Logo"
                            className="size-14 dark:hidden"
                        />
                        <img
                            src={logoDarkUrl}
                            alt="Logo"
                            className="size-14 hidden dark:inline-block"
                        />
                        {realm.displayNameHtml ? (
                            <span
                                className="text-xl"
                                dangerouslySetInnerHTML={{
                                    __html: kcSanitize(realm.displayNameHtml)
                                }}
                            />
                        ) : (
                            <span className="text-xl">
                                {realm.displayName || realm.name}
                            </span>
                        )}
                    </div>
                </div>

                <CardTitle>
                    {displayRequiredFields ? (
                        <div className="flex items-center justify-between gap-2">
                            <div>{titleNode}</div>
                            <div>
                                <span className="subtitle">
                                    <span className="text-red-500">*</span>
                                    {msg("requiredFields")}
                                </span>
                            </div>
                        </div>
                    ) : (
                        titleNode
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div id="kc-content" className="flex flex-col gap-4">
                    {displayMessage &&
                        message !== undefined &&
                        (message.type !== "warning" || !isAppInitiatedAction) && (
                            <Alert variant={message.type}>
                                <AlertDescription>
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: kcSanitize(message.summary)
                                        }}
                                    />
                                </AlertDescription>
                            </Alert>
                        )}

                    {socialProvidersNode}
                    {children}

                    {auth !== undefined && auth.showTryAnotherWayLink && (
                        <form
                            id="kc-select-try-another-way-form"
                            action={url.loginAction}
                            method="post"
                        >
                            <div className={kcClsx("kcFormGroupClass")}>
                                <input type="hidden" name="tryAnotherWay" value="on" />
                                <Button
                                    type="button"
                                    className="w-full"
                                    variant="outline"
                                    asChild
                                >
                                    <a
                                        href="#"
                                        id="try-another-way"
                                        onClick={event => {
                                            document.forms[
                                                "kc-select-try-another-way-form" as never
                                            ].submit();
                                            event.preventDefault();
                                            return false;
                                        }}
                                    >
                                        {msg("doTryAnotherWay")}
                                    </a>
                                </Button>
                            </div>
                        </form>
                    )}

                    {displayInfo && <div className="text-center text-sm">{infoNode}</div>}
                </div>
            </CardContent>
        </Card>
    );
}

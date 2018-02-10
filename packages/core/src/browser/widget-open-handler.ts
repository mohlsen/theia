/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

// tslint:disable:no-any

import { inject, postConstruct, injectable } from "inversify";
import URI from "../common/uri";
import { MaybePromise, Emitter, Event } from "../common";
import { BaseWidget } from "./widgets";
import { ApplicationShell } from "./shell";
import { OpenHandler, OpenerOptions } from "./opener-service";
import { WidgetManager } from "./widget-manager";

export type WidgetOpenMode = 'open' | 'reveal' | 'activate';

export interface WidgetOpenerOptions extends OpenerOptions {
    /**
     * Whether the widget should be only opened, revealed or activated.
     * By default is `activate`.
     */
    mode?: WidgetOpenMode;
    /**
     * Specify how an opened widget should be added to the shell.
     * By default to the main area.
     */
    widgetOptions?: ApplicationShell.WidgetOptions;
}

@injectable()
export abstract class WidgetOpenHandler<W extends BaseWidget> implements OpenHandler {

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;

    protected readonly onCreatedEmitter = new Emitter<W>();
    /**
     * Emit when a new widget is created.
     */
    readonly onCreated: Event<W> = this.onCreatedEmitter.event;

    @postConstruct()
    protected init(): void {
        this.widgetManager.onDidCreateWidget(({ factoryId, widget }) => {
            if (factoryId === this.id) {
                this.onCreatedEmitter.fire(widget as W);
            }
        });
    }

    /**
     * The widget opeh handler id.
     *
     * #### Implementation
     * - A widget factory for this id should be registered.
     * - Subclasses should not implement `WidgetFactory`
     * to avoid exposing capabilities to create a widget outside of `WidgetManager`.
     */
    abstract readonly id: string;
    abstract canHandle(uri: URI, options?: WidgetOpenerOptions): MaybePromise<number>;

    /**
     * Open a widget for the given uri and options.
     * Reject if the given options is not an widget options or a widget cannot be opened.
     */
    async open(uri: URI, options?: WidgetOpenerOptions): Promise<W> {
        const widget = await this.getOrCreateWidget(uri, options);
        this.doOpen(widget, options);
        return widget;
    }
    protected doOpen(widget: W, options?: WidgetOpenerOptions): void {
        const op: WidgetOpenerOptions = {
            mode: 'activate',
            ...options
        };
        if (!widget.isAttached) {
            this.shell.addWidget(widget, op.widgetOptions || { area: 'main' });
        }
        if (op.mode === 'activate') {
            this.shell.activateWidget(widget.id);
        } else if (op.mode === 'reveal') {
            this.shell.revealWidget(widget.id);
        }
    }

    /**
     * Return an opened widget for the given uri.
     */
    getByUri(uri: URI): Promise<W | undefined> {
        return this.getWidget(uri);
    }

    /**
     * All opened widgets.
     */
    get all(): W[] {
        return this.widgetManager.getWidgets(this.id) as W[];
    }

    protected getWidget(uri: URI, options?: WidgetOpenerOptions): Promise<W | undefined> {
        const widgetOptions = this.createWidgetOptions(uri, options);
        return this.widgetManager.getWidget(this.id, widgetOptions) as Promise<W | undefined>;
    }

    protected getOrCreateWidget(uri: URI, options?: WidgetOpenerOptions): Promise<W> {
        const widgetOptions = this.createWidgetOptions(uri, options);
        return this.widgetManager.getOrCreateWidget(this.id, widgetOptions) as Promise<W>;
    }

    protected createWidgetOptions(uri: URI, options?: WidgetOpenerOptions): Object {
        return uri.withoutFragment().toString();
    }

}
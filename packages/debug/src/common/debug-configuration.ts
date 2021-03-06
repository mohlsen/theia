/********************************************************************************
 * Copyright (C) 2018 Red Hat, Inc. and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

// tslint:disable:no-any

export type DebugViewLocation = 'default' | 'left' | 'right' | 'bottom';

/**
 * Configuration for a debug adapter session.
 */
export interface DebugConfiguration {
    /**
     * The type of the debug adapter session.
     */
    type: string;

    /**
     * The name of the debug adapter session.
     */
    name: string;

    /**
     * Additional debug type specific properties.
     */
    [key: string]: any;

    /**
     * If noDebug is true the launch request should launch the program without enabling debugging.
     */
    noDebug?: boolean;

    /**
     * Optional data from the previous, restarted session.
     * The data is sent as the 'restart' attribute of the 'terminated' event.
     * The client should leave the data intact.
     */
    __restart?: any;

    /** default: default */
    debugViewLocation?: DebugViewLocation

    /** default: neverOpen */
    openDebug?: 'neverOpen' | 'openOnSessionStart' | 'openOnFirstSessionStart' | 'openOnDebugBreak';

    /** default: neverOpen */
    internalConsoleOptions?: 'neverOpen' | 'openOnSessionStart' | 'openOnFirstSessionStart'

    __resovled?: boolean
    __configurationId?: number
}
export namespace DebugConfiguration {
    export function is(arg: DebugConfiguration | any): arg is DebugConfiguration {
        return !!arg && 'type' in arg && 'name' in arg;
    }
}

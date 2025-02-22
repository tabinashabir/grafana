import { css } from '@emotion/css';
import React, { ReactElement } from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { GrafanaTheme2 } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { reportInteraction } from '@grafana/runtime';
import { Button, Icon, IconButton, useStyles2, useTheme2 } from '@grafana/ui';

import { isAdHoc } from '../guard';
import { VariableUsagesButton } from '../inspect/VariableUsagesButton';
import { getVariableUsages, UsagesToNetwork, VariableUsageTree } from '../inspect/utils';
import { KeyedVariableIdentifier } from '../state/types';
import { VariableModel } from '../types';
import { toKeyedVariableIdentifier } from '../utils';

export interface VariableEditorListRowProps {
  index: number;
  variable: VariableModel;
  usageTree: VariableUsageTree[];
  usagesNetwork: UsagesToNetwork[];
  onEdit: (identifier: KeyedVariableIdentifier) => void;
  onDuplicate: (identifier: KeyedVariableIdentifier) => void;
  onDelete: (identifier: KeyedVariableIdentifier) => void;
}

export function VariableEditorListRow({
  index,
  variable,
  usageTree,
  usagesNetwork,
  onEdit: propsOnEdit,
  onDuplicate: propsOnDuplicate,
  onDelete: propsOnDelete,
}: VariableEditorListRowProps): ReactElement {
  const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const usages = getVariableUsages(variable.id, usageTree);
  const passed = usages > 0 || isAdHoc(variable);
  const identifier = toKeyedVariableIdentifier(variable);

  return (
    <Draggable draggableId={JSON.stringify(identifier)} index={index}>
      {(provided, snapshot) => (
        <tr
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            userSelect: snapshot.isDragging ? 'none' : 'auto',
            background: snapshot.isDragging ? theme.colors.background.secondary : undefined,
            ...provided.draggableProps.style,
          }}
        >
          <td role="gridcell" className={styles.column}>
            <Button
              size="xs"
              fill="text"
              onClick={(event) => {
                event.preventDefault();
                propsOnEdit(identifier);
              }}
              className={styles.nameLink}
              aria-label={selectors.pages.Dashboard.Settings.Variables.List.tableRowNameFields(variable.name)}
            >
              {variable.name}
            </Button>
          </td>
          <td
            role="gridcell"
            className={styles.descriptionColumn}
            onClick={(event) => {
              event.preventDefault();
              propsOnEdit(identifier);
            }}
            aria-label={selectors.pages.Dashboard.Settings.Variables.List.tableRowDescriptionFields(variable.name)}
          >
            {variable.description}
          </td>

          <td role="gridcell" className={styles.column}>
            <VariableCheckIndicator passed={passed} />
          </td>

          <td role="gridcell" className={styles.column}>
            <VariableUsagesButton id={variable.id} isAdhoc={isAdHoc(variable)} usages={usagesNetwork} />
          </td>

          <td role="gridcell" className={styles.column}>
            <IconButton
              onClick={(event) => {
                event.preventDefault();
                reportInteraction('Duplicate variable');
                propsOnDuplicate(identifier);
              }}
              name="copy"
              tooltip="Duplicate variable"
              aria-label={selectors.pages.Dashboard.Settings.Variables.List.tableRowDuplicateButtons(variable.name)}
            />
          </td>

          <td role="gridcell" className={styles.column}>
            <IconButton
              onClick={(event) => {
                event.preventDefault();
                reportInteraction('Delete variable');
                propsOnDelete(identifier);
              }}
              name="trash-alt"
              tooltip="Remove variable"
              aria-label={selectors.pages.Dashboard.Settings.Variables.List.tableRowRemoveButtons(variable.name)}
            />
          </td>
          <td role="gridcell" className={styles.column}>
            <div {...provided.dragHandleProps} className={styles.dragHandle}>
              <Icon name="draggabledots" size="lg" />
            </div>
          </td>
        </tr>
      )}
    </Draggable>
  );
}

interface VariableCheckIndicatorProps {
  passed: boolean;
}

function VariableCheckIndicator({ passed }: VariableCheckIndicatorProps): ReactElement {
  const styles = useStyles2(getStyles);
  if (passed) {
    return (
      <Icon
        name="check"
        className={styles.iconPassed}
        title="This variable is referenced by other variables or dashboard."
      />
    );
  }

  return (
    <Icon
      name="exclamation-triangle"
      className={styles.iconFailed}
      title="This variable is not referenced by any variable or dashboard."
    />
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    dragHandle: css`
      cursor: grab;
    `,
    column: css`
      width: 1%;
    `,
    nameLink: css`
      cursor: pointer;
      color: ${theme.colors.primary.text};
    `,
    descriptionColumn: css`
      width: 100%;
      max-width: 200px;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
      white-space: nowrap;
    `,
    iconPassed: css`
      color: ${theme.v1.palette.greenBase};
    `,
    iconFailed: css`
      color: ${theme.v1.palette.orange};
    `,
  };
}

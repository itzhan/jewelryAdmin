import React, { memo, useEffect, useRef, useState } from 'react';
import { Row, Col, Card, Select, InputNumber, Radio, Button, Table, Tag, Dialog, Form, Input, Switch, MessagePlugin } from 'tdesign-react';
import classnames from 'classnames';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { selectStoneList, fetchStoneFilters, fetchStoneList, setFilterValues, setPagination, resetStoneListState } from 'modules/backend/stoneList';
import { createStone, updateStone, deleteStone, StoneItem, StonePayload } from 'services/backend';
import CommonStyle from 'styles/common.module.less';
import style from './index.module.less';

const { Option } = Select;
const { FormItem } = Form;

const StoneListPage = () => {
  const dispatch = useAppDispatch();
  const { filters, filtersLoading, filterValues, list, loading, page, pageSize, total } = useAppSelector(selectStoneList);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<StoneItem | null>(null);
  const formRef = useRef<any>();

  useEffect(() => {
    dispatch(fetchStoneFilters());
    dispatch(fetchStoneList());
    return () => {
      dispatch(resetStoneListState());
    };
  }, []);

  const handleFilterChange = (values: Partial<typeof filterValues>) => {
    dispatch(setFilterValues(values));
  };

  const handleSearch = () => {
    dispatch(fetchStoneList());
  };

  const handleAdd = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const handleEdit = (record: StoneItem) => {
    setEditing(record);
    setFormVisible(true);
  };

  const handleDelete = async (record: StoneItem) => {
    try {
      setSaving(true);
      await deleteStone(record.id);
      MessagePlugin.success('删除成功');
      dispatch(fetchStoneList());
    } catch (e) {
      MessagePlugin.error('删除失败');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (ctx: any) => {
    if (ctx.validateResult !== true) return;
    const values = formRef.current?.getFieldsValue?.(true) as any;

    const payload: StonePayload = {
      type: values.type,
      shapeCode: values.shapeCode,
      carat: Number(values.carat),
      colorCode: values.colorCode,
      clarityCode: values.clarityCode,
      cutCode: values.cutCode,
      certificateCode: values.certificateCode || undefined,
      ratio: Number(values.ratio),
      lengthMm: values.lengthMm !== undefined ? Number(values.lengthMm) : undefined,
      widthMm: values.widthMm !== undefined ? Number(values.widthMm) : undefined,
      depthMm: values.depthMm !== undefined ? Number(values.depthMm) : undefined,
      price: Number(values.price),
      currency: values.currency,
      isAvailable: values.isAvailable,
    };

    try {
      setSaving(true);
      if (editing) {
        await updateStone(editing.id, payload);
        MessagePlugin.success('更新成功');
      } else {
        await createStone(payload);
        MessagePlugin.success('创建成功');
      }
      setFormVisible(false);
      dispatch(fetchStoneList());
    } catch (e) {
      MessagePlugin.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      colKey: 'id',
      title: 'ID',
      width: 80,
      align: 'left' as const,
    },
    {
      colKey: 'type',
      title: '类型',
      width: 100,
      cell({ row }: any) {
        return row.type === 'lab_grown' ? (
          <Tag theme='success' variant='light'>
            培育钻
          </Tag>
        ) : (
          <Tag theme='primary' variant='light'>
            天然钻
          </Tag>
        );
      },
    },
    {
      colKey: 'shape',
      title: '形状',
      width: 120,
    },
    {
      colKey: 'carat',
      title: '克拉',
      width: 100,
    },
    {
      colKey: 'color',
      title: '颜色',
      width: 100,
    },
    {
      colKey: 'clarity',
      title: '净度',
      width: 100,
    },
    {
      colKey: 'cut',
      title: '切工',
      width: 120,
    },
    {
      colKey: 'certificate',
      title: '证书',
      width: 120,
    },
    {
      colKey: 'price',
      title: '价格',
      width: 140,
      cell({ row }: any) {
        return `${row.price} ${row.currency || ''}`;
      },
    },
    {
      colKey: 'ratio',
      title: '比率',
      width: 100,
    },
    {
      colKey: 'lengthMm',
      title: '长 (mm)',
      width: 120,
    },
    {
      colKey: 'widthMm',
      title: '宽 (mm)',
      width: 120,
    },
    {
      colKey: 'depthMm',
      title: '深 (mm)',
      width: 120,
    },
    {
      colKey: 'op',
      title: '操作',
      width: 180,
      cell({ row }: { row: StoneItem }) {
        return (
          <>
            <Button theme='primary' variant='text' onClick={() => handleEdit(row)}>
              编辑
            </Button>
            <Button theme='danger' variant='text' onClick={() => handleDelete(row)}>
              删除
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <div className={classnames(CommonStyle.pageWithPadding, CommonStyle.pageWithColor)}>
      <Card title='石头筛选' loading={filtersLoading} bordered={false}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className={style.filterItem}>
              <span>形状：</span>
              <Select
                clearable
                placeholder='请选择形状'
                value={filterValues.shape}
                style={{ width: 240 }}
                onChange={(value) => handleFilterChange({ shape: value as string })}
              >
                {filters?.shapes?.map((item) => (
                  <Option key={item.code} value={item.code} label={item.label} />
                ))}
              </Select>
            </div>
          </Col>
          <Col span={12}>
            <div className={style.filterItem}>
              <span>类型：</span>
              <Radio.Group
                variant='default-filled'
                value={filterValues.type}
                onChange={(value) => handleFilterChange({ type: value as 'natural' | 'lab_grown' })}
              >
                <Radio.Button value={undefined}>全部</Radio.Button>
                <Radio.Button value='natural'>天然钻</Radio.Button>
                <Radio.Button value='lab_grown'>培育钻</Radio.Button>
              </Radio.Group>
            </div>
          </Col>
          <Col span={12}>
            <div className={style.filterItem}>
              <span>颜色：</span>
              <Select
                multiple
                clearable
                placeholder='请选择颜色'
                value={filterValues.colors}
                style={{ width: 240 }}
                onChange={(value) => handleFilterChange({ colors: value as string[] })}
              >
                {filters?.colors?.map((item) => (
                  <Option key={item.code} value={item.code} label={item.label} />
                ))}
              </Select>
            </div>
          </Col>
          <Col span={12}>
            <div className={style.filterItem}>
              <span>净度：</span>
              <Select
                multiple
                clearable
                placeholder='请选择净度'
                value={filterValues.clarities}
                style={{ width: 240 }}
                onChange={(value) => handleFilterChange({ clarities: value as string[] })}
              >
                {filters?.clarities?.map((item) => (
                  <Option key={item.code} value={item.code} label={item.label} />
                ))}
              </Select>
            </div>
          </Col>
          <Col span={12}>
            <div className={style.filterItem}>
              <span>切工：</span>
              <Select
                clearable
                placeholder='请选择切工'
                value={filterValues.cut}
                style={{ width: 240 }}
                onChange={(value) => handleFilterChange({ cut: value as string })}
              >
                {filters?.cuts?.map((item) => (
                  <Option key={item.code} value={item.code} label={item.label} />
                ))}
              </Select>
            </div>
          </Col>
          <Col span={12}>
            <div className={style.filterItem}>
              <span>证书：</span>
              <Select
                multiple
                clearable
                placeholder='请选择证书'
                value={filterValues.certificates}
                style={{ width: 240 }}
                onChange={(value) => handleFilterChange({ certificates: value as string[] })}
              >
                {filters?.certificates?.map((item) => (
                  <Option key={item.code} value={item.code} label={item.label} />
                ))}
              </Select>
            </div>
          </Col>
          <Col span={12}>
            <div className={style.filterItem}>
              <span>克拉范围：</span>
              <InputNumber
                placeholder='最小克拉'
                value={filterValues.minCarat}
                style={{ width: 120, marginRight: 8 }}
                onChange={(value) => handleFilterChange({ minCarat: value as number })}
              />
              ~
              <InputNumber
                placeholder='最大克拉'
                value={filterValues.maxCarat}
                style={{ width: 120, marginLeft: 8 }}
                onChange={(value) => handleFilterChange({ maxCarat: value as number })}
              />
            </div>
          </Col>
          <Col span={12}>
            <div className={style.filterItem}>
              <span>预算范围：</span>
              <InputNumber
                placeholder='最小预算'
                value={filterValues.minBudget}
                style={{ width: 120, marginRight: 8 }}
                onChange={(value) => handleFilterChange({ minBudget: value as number })}
              />
              ~
              <InputNumber
                placeholder='最大预算'
                value={filterValues.maxBudget}
                style={{ width: 120, marginLeft: 8 }}
                onChange={(value) => handleFilterChange({ maxBudget: value as number })}
              />
            </div>
          </Col>
          <Col span={24}>
            <Button theme='primary' onClick={handleSearch}>
              查询
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        style={{ marginTop: 16 }}
        title='石头列表'
        bordered={false}
        actions={
          <Button theme='primary' onClick={handleAdd}>
            新增石头
          </Button>
        }
      >
        <Table
          rowKey='id'
          loading={loading}
          data={list}
          columns={columns}
          pagination={{
            pageSize,
            current: page,
            total,
            showJumper: true,
            onChange: (current, pageInfo) => {
              dispatch(
                setPagination({
                  page: current,
                  pageSize: pageInfo.pageSize,
                }),
              );
              dispatch(fetchStoneList());
            },
            onPageSizeChange: (size) => {
              dispatch(
                setPagination({
                  page: 1,
                  pageSize: size,
                }),
              );
              dispatch(fetchStoneList());
            },
          }}
        />
      </Card>

      <Dialog
        header={editing ? '编辑石头' : '新增石头'}
        visible={formVisible}
        confirmBtn={{ content: '保存', loading: saving }}
        cancelBtn='取消'
        onClose={() => setFormVisible(false)}
        onConfirm={() => formRef.current?.submit?.()}
        width='720px'
      >
        <Form
          ref={formRef}
          labelWidth={90}
          onSubmit={onSubmit}
          colon
          key={editing ? editing.id : 'new'}
        >
          <FormItem
            label='类型'
            name='type'
            initialData={editing?.type || 'lab_grown'}
            rules={[{ required: true, message: '请选择类型', type: 'error' }]}
          >
            <Radio.Group>
              <Radio.Button value='natural'>天然钻</Radio.Button>
              <Radio.Button value='lab_grown'>培育钻</Radio.Button>
            </Radio.Group>
          </FormItem>

          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem
                label='形状'
                name='shapeCode'
                initialData={editing?.shape}
                rules={[{ required: true, message: '请选择形状', type: 'error' }]}
              >
                <Select placeholder='请选择形状'>
                  {filters?.shapes?.map((item) => (
                    <Option key={item.code} value={item.code} label={item.label} />
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='颜色'
                name='colorCode'
                initialData={editing?.color}
                rules={[{ required: true, message: '请选择颜色', type: 'error' }]}
              >
                <Select placeholder='请选择颜色'>
                  {filters?.colors?.map((item) => (
                    <Option key={item.code} value={item.code} label={item.label} />
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='净度'
                name='clarityCode'
                initialData={editing?.clarity}
                rules={[{ required: true, message: '请选择净度', type: 'error' }]}
              >
                <Select placeholder='请选择净度'>
                  {filters?.clarities?.map((item) => (
                    <Option key={item.code} value={item.code} label={item.label} />
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='切工'
                name='cutCode'
                initialData={editing?.cut}
                rules={[{ required: true, message: '请选择切工', type: 'error' }]}
              >
                <Select placeholder='请选择切工'>
                  {filters?.cuts?.map((item) => (
                    <Option key={item.code} value={item.code} label={item.label} />
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem
                label='克拉'
                name='carat'
                initialData={editing?.carat}
                rules={[{ required: true, message: '请输入克拉', type: 'error' }]}
              >
                <InputNumber min={0} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label='比率'
                name='ratio'
                initialData={editing?.ratio}
                rules={[{ required: true, message: '请输入比率', type: 'error' }]}
              >
                <InputNumber min={0} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='价格' name='price' initialData={editing?.price}>
                <InputNumber min={0} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='币种' name='currency' initialData={editing?.currency || 'USD'}>
                <Input placeholder='例如 USD' />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={6}>
              <FormItem label='长 (mm)' name='lengthMm' initialData={editing?.lengthMm}>
                <InputNumber min={0} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='宽 (mm)' name='widthMm' initialData={editing?.widthMm}>
                <InputNumber min={0} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='深 (mm)' name='depthMm' initialData={editing?.depthMm}>
                <InputNumber min={0} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='证书' name='certificateCode' initialData={editing?.certificate}>
                <Select clearable placeholder='请选择证书'>
                  {filters?.certificates?.map((item) => (
                    <Option key={item.code} value={item.code} label={item.label} />
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>

          <FormItem label='是否可用' name='isAvailable' initialData={editing?.isAvailable ?? true}>
            <Switch />
          </FormItem>
        </Form>
      </Dialog>
    </div>
  );
};

export default memo(StoneListPage);
